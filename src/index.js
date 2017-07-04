/**
* Реактивный менеджер данных, следящий за изменениями данных и выполняющий действия в ответ на эти изменения
* Отслеживание происходит лениво, данные обновляются только когда они требуются
*
* @param {ManagerOptions} [options] Настройки менеджера
*/
export class Manager {
	constructor (options) {
		this.isObservableSymbol = Symbol("isObservable");
		this.observables = new WeakMap();
		this.cache = new WeakMap();
		this.options = {
			enabled: true,
			immediateReaction: false
		};
		this.callStack = [];
		this.reactions = [];
		this.setOptions(options);
	}
	/**
	* Динамически устанавливает настройки работы менеджера данных
	*
	* @param {ManagerOptions} [options] Настройки менеджера
	*/
	setOptions (options = {}) {
		this.options = Object.assign(this.options, options);
	}
	/**
	* Создает {@link Observable} объект для указанного источника данный
	*
	* @param {(Object|Array)} dataSource источник данных
	* @return {Observable} отслеживаемый объект
	*/
	makeObservable (dataSource) {
		if (!dataSource) {
			return dataSource;
		}
		if (this.isObservable(dataSource)) {
			return dataSource;
		}
		let observable = this.observables.get(dataSource);
		if (!observable) {
			const toUpdate = new Map();
			observable = new Proxy(dataSource, {
				get: (obj, key) => {
					if (key === this.isObservableSymbol) {
						return true;
					}
					if (this.callStack.length) {
						const callStack = [...this.callStack];
						const context = callStack[callStack.length - 1];

						let callStacks = toUpdate.get(key);
						if (!callStacks) {
							callStacks = new Map();
							toUpdate.set(key, callStacks);
							callStacks.set(context.call, callStack);
						}
						if (!callStacks.has(context.call)) {
							callStacks.set(context.call, callStack);
						}
					}

					const val = obj[key];
					if (val === Object(val) && typeof val !== "function") {
						return this.makeObservable(val);
					}
					return val;
				},
				set: (obj, key, val) => {
					if (this.callStack && this.callStack.length) {
						throw new Error("Changing observable objects is restricted inside computed properties and reaction functions!");
					}


					if (val !== obj[key] || (Array.isArray(obj) && key === "length")) {
						obj[key] = val;
						const callStacks = toUpdate.get(key);

						if (callStacks) {
							callStacks.forEach((callStack) => {
								callStack.reverse().some(({obj, call}) => {
									const record = this.cache.get(obj).get(call);
									if (!record || !record.valid) {
										return true;
									}
									else {
										record.valid = false;
									}
								});
							});
						}

						toUpdate.delete(key);
						if (!this.inRunSection) {
							if (this.options.immediateReaction) {
								this.run();
							}
							else {
								this.runDeferred();
							}
						}
					}
					return true;
				}
			});
			this.observables.set(dataSource, observable);
		}
		return observable;
	}
	/**
	* Создает {@link UpdatableFunction}
	* Используется в основном для внутренних целей
	*
	* @param {Function} call Функция для которой будет создана {@link UpdatableFunction}
	* @param {Object} obj Если `call` это метод объекта необходимо указать связанный объект
	* @return {UpdatableFunction}
	*/
	makeUpdatable (call, obj = null) {
		const manager = this;
		if (obj == null) {
			obj = manager;
		}
		return function () {
			let cacheByObject = manager.cache.get(obj);
			let record;
			if (cacheByObject) {
				record = cacheByObject.get(call);
			}
			else {
				cacheByObject = new Map();
				manager.cache.set(obj, cacheByObject);
			}

			if (!record) {
				record = {valid: false, value: undefined};
				cacheByObject.set(call, record);
			}
			if (record.computing) {
				console.warn("Detected cross reference inside computed properties! undefined will be returned to prevent infinite loop");
				return undefined;
			}

			if (record.valid) {
				return record.value;
			}
			record.computing = true;
			manager.callStack.push({obj, call});
			try {
				let context;
				if (this) {
					context = manager.observables.get(this);
				}
				else {
					context = manager;
				}

				const value = call.call(context, context);
				record.valid = true;
				record.value = value;
				return value;
			}
			finally {
				record.computing = false;
				manager.callStack.pop();
			}
		};
	}
	/**
	* Создает вычисляемое свойство объекта
	*
	* @param {Object} obj Объект для которого будет создано вычисляемое свойство
	* @param {String} key Имя вычисляемого свойства свойства
	* @param {Function} callOnGet Функция которая будет вычислятся при доступе к свойству
	* @param {Function} [callOnSet] Функция которая будет выполнятся при установке значения свойства
	*/
	makeComputed (obj, key, callOnGet, callOnSet) {
		Object.defineProperty(obj, key, {
			enumerable: true,
			get: this.makeUpdatable(callOnGet, obj),
			set: callOnSet
		});
	}
	/**
	* Создает {@link UpdatableFunction} и помещает ее в список для проверки
	* на валидность при изменении данных. Менеджер автозапускает эту
	* функцию если ее результат стал невалидным
	*
	* @param {Function} call
	*	Функция для которой будет создана {@link UpdatableFunction}
	*	Она будет автозапускатся при изменении {@link Observable} данных использованых при ее вычислении
	* @param {Boolean} run
	*	Выполнить первый запуск реации после ее регистрации.
	*	В зависимости от указанной опции {@link ManagerOptions.immediateReaction}
	*	будет запускатся либо сразу либо по таймауту.
	*	Если {@link ManagerOptions.enabled} == false то реакция не будет выполнятся даже при установленном параметре run
	* @return {ReactionHandler} Управляющий объект для зарегестрированной реакции
	*/
	makeReaction (call, run = true) {
		const manager = this;
		const updatable = this.makeUpdatable(call);
		manager.reactions.push(updatable);
		if (run) {
			if (this.options.immediateReaction) {
				manager.run();
			}
			else {
				manager.runDeferred();
			}
		}
		return {
			unregister () {
				const idx = manager.reactions.indexOf(updatable);
				if (idx >= 0) {
					manager.reactions.splice(idx, 1);
				}
			},
			reaction: updatable
		};
	}

	/**
	* Проверяет является ли объект наблюдаемым
	*
	* @param {(Observable|Object|Array)} obj
	*/
	isObservable (obj) {
		return obj[this.isObservableSymbol] === true;
	}
	/**
	* Запускает все автозапускаемые функции которые помечены как невалидные
	*
	* @param {Function} [action]
	*	Действия выполняемые внутри вызова этой функции
	* 	не будут вызывать неотложный запуск реакций.
	* 	Реакции будут запущены только после выхода из функции action
	*/
	run (action) {
		if (!this.options.enabled) {
			return;
		}
		this.inRunSection = true;
		try {
			if (typeof action === "function") {
				action();
			}
			this.runScheduled = false;
			this.reactions.forEach(updatable => updatable());
			typeof this.onAfterRun === "function" && this.onAfterRun();
		}
		finally {
			this.inRunSection = false;
		}
	}
	/**
	* Запускает все {@link UpdatableFunction} которые помечены как невалидные
	* В отличии от метода {@link run} запускает их не сразу а по указанному таймауту
	*
	* @param {Function} [action] Изменения {@link Observable} выполняемые внутри вызова этой функции не будут вызывать неотложный запуск реакций. Реакции будут запускатся после заданного таймаута
	* @param {Number} [timeout=0] Таймаут запуска выполнения очереди зарегестрированых реакций
	*/
	runDeferred (action) {
		if (!this.options.enabled) {
			return;
		}
		this.inRunSection = true;
		try {
			if (!this.runScheduled) {
				this.runScheduled = setTimeout(() => this.run());
			}
			if (typeof action === "function") {
				action();
			}
		}
		finally {
			this.inRunSection = false;
		}
	}
}


Manager.default = new Manager();
Manager.default.Manager = Manager;

export default Manager.default;

/**
 * @typedef ManagerOptions
 * @name ManagerOptions
 * @type {Object}
 * @property {Boolean} immediateReaction - Запускать реакции сразу после изменения данных (по-умолчанию false - т.е. реакции выполняются по нулевому таймауту)
 * @property {Boolean} enabled - Активен ли менеджер данных (по-умолчнию true)
 */

 /**
  * @typedef ReactionHandler
  * @name ReactionHandler
  * @type {Object}
  * @property {Function} unregister - Удалить реакцию из списка зарегестрированных реакций
  * @property {UpdatableFunction} reaction - Фунция реакции
  */

 /**
  * @typedef Observable
  * @name Observable
  * @description Обьект или массив доступ к свойствам которого отслеживается.
  * При доступе к дочерним объектам или массивам также возвращается {@link Observable} объект
  */

/**
 * @typedef UpdatableFunction
 * @name UpdatableFunction
 * @description Функция которая кеширует результат своего выполнение и хранит состояние валидности результата
 *
 * При изменении {@link Observable} данных которые были использованы при вычилении этой функции ее кеш инвалидируется
 *
 * Внутри {@link UpdatableFunction} разрешено только чтение {@link Observable}, при записи будет брошено исключение
 *
 * Если внутри таких функций есть перекрестные ссылки то вычисление производится не будет, будет возвращено `undefined`
 */
