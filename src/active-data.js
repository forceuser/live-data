const maxIterations = 10;

/**
 * Реактивный менеджер данных, следящий за изменениями данных
 * и выполняющий действия в ответ на эти изменения
 * Отслеживание происходит лениво, данные обновляются только когда они требуются
 *
 * @param {ManagerOptions} [options] Настройки менеджера
 */
export class Manager {
	constructor (options) {
		this.$isObservableSymbol = Symbol("isObservable");
		this.$registerRead = Symbol("registerRead");
		this.$dataSource = Symbol("dataSource");
		this.observables = new WeakMap();
		this.cache = new WeakMap();
		this.options = {
			enabled: true,
			prototypes: false,
			immediateReaction: false,
			watchKey: "$$watch",
			watchDeepKey: "$$watchDeep",
			dataSourceKey: "$$dataSource",
		};
		this.callStack = [];
		this.reactionsToUpdate = new Set();
		this.setOptions(options);

		this.observable = this.makeObservable.bind(this);
		this.reaction = this.makeReaction.bind(this);
		this.computed = this.makeComputed.bind(this);
		this.updatable = this.makeUpdatable.bind(this);
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
		const manager = this;
		if (!dataSource) {
			return dataSource;
		}
		if (
			dataSource.constructor !== Object &&
			dataSource.constructor !== Array
		) {
			return dataSource;
		}

		if (manager.isObservable(dataSource)) {
			return dataSource;
		}
		let observable = manager.observables.get(dataSource);
		if (!observable) {
			const toUpdate = new Map();
			const invalidateDeps = updatableState => {
				manager.valid = false;
				updatableState.invalidIteration = true;
				updatableState.onInvalidate && updatableState.onInvalidate();
				if (updatableState.valid) {
					updatableState.valid = false;
					updatableState.deps.forEach(updatableState =>
						invalidateDeps(updatableState)
					);
				}
				updatableState.deps.clear();
			};

			const initUpdates = key => {
				const updates = {
					updatableStates: new Set(),
					updatableStateMap: new WeakMap(),
				};
				toUpdate.set(key, updates);
				return updates;
			};
			let watchDeepSection = false;
			const registerRead = (updatableState, key, prototypes) => {
				let currentKey = key;
				if (key === manager.options.watchDeepKey) {
					if (watchDeepSection) {
						return;
					}
					watchDeepSection = true;
					Object.keys(dataSource).forEach(key => {
						if (typeof dataSource[key] === "object") {
							const obs = manager.makeObservable(dataSource[key]);
							obs[manager.options.watchDeepKey];
						}
					});
					currentKey = manager.options.watchKey;
					watchDeepSection = false;
				}

				let updates = toUpdate.get(currentKey);
				if (!updates) {
					updates = initUpdates(currentKey);
				}
				updates.updatableStates.add(updatableState);
				let updatableStateEx = updates.updatableStateMap.get(
					updatableState
				);
				if (!updatableStateEx) {
					updatableStateEx = {};
					updates.updatableStateMap.set(
						updatableState,
						updatableStateEx
					);
				}
				updatableState.uninit.set(dataSource, updatableState => {
					updates.updatableStates.delete(updatableState);
					updates.updatableStateMap.delete(updatableState);
					if (updates.updatableStates.size === 0) {
						toUpdate.delete(currentKey);
					}
				});
				if (manager.options.prototypes) {
					const isRoot = !prototypes;
					if (isRoot) {
						prototypes = [dataSource];
						updatableStateEx.root = true;
					}
					else {
						const rootObj = prototypes[prototypes.length - 1];
						if (!updatableStateEx.prototypes) {
							updatableStateEx.prototypes = new Map();
						}
						const _prototypes = updatableStateEx.prototypes.get(
							rootObj
						);
						if (_prototypes) {
							return;
						}
						updatableStateEx.prototypes.set(rootObj, prototypes);
					}

					let proto = Object.getPrototypeOf(dataSource);
					while (proto != null && proto != Object.prototype) {
						const observableProto = manager.observables.get(proto);
						prototypes.unshift(proto);
						if (
							observableProto != null &&
							observableProto !== Object.prototype
						) {
							observableProto[manager.$registerRead](
								updatableState,
								key,
								prototypes
							);
							break;
						}
						proto = Object.getPrototypeOf(proto);
					}
				}
				else {
					updatableStateEx.root = true;
				}
			};

			const updateProperty = (obj, key) => {
				[key, manager.options.watchKey].forEach(updKey => {
					const updates = toUpdate.get(updKey);
					if (updates) {
						updates.updatableStates.forEach(updatableState => {
							const updatableStateEx = updates.updatableStateMap.get(
								updatableState
							);
							if (updatableStateEx.root) {
								invalidateDeps(updatableState);
							}
							else {
								const invalidateAll = [
									...updatableStateEx.prototypes.values(),
								].some(prototypes => {
									const idx = prototypes.indexOf(obj) + 1;
									const l = prototypes.length;
									let invalidate = true;
									for (let i = idx; i < l; i++) {
										if (prototypes[i].hasOwnProperty(key)) {
											invalidate = false;
											break;
										}
									}
									return invalidate;
								});

								if (invalidateAll) {
									invalidateDeps(updatableState);
								}
							}
						});
					}
				});

				if (!manager.inRunSection) {
					if (manager.options.immediateReaction) {
						manager.run();
					}
					else {
						manager.runDeferred();
					}
				}
			};

			observable = new Proxy(dataSource, {
				get: (obj, key, context) => {
					if (key === manager.$isObservableSymbol) {
						return true;
					}
					if (key === manager.options.dataSourceKey) {
						return dataSource;
					}

					const propertyDescriptor = Object.getOwnPropertyDescriptor(
						obj,
						key
					);

					if (
						propertyDescriptor &&
						typeof propertyDescriptor.get === "function"
					) {
						return manager
							.makeUpdatable(propertyDescriptor.get, {obj})
							.call(obj);
					}

					if (manager.callStack.length) {
						if (key === manager.$registerRead) {
							return registerRead;
						}
						registerRead(
							manager.callStack[manager.callStack.length - 1]
								.updatableState,
							key
						);
					}

					if (
						key === manager.options.watchKey ||
						key === manager.options.watchDeepKey
					) {
						return context;
					}

					const val = obj[key];
					if (typeof val === "object") {
						return manager.makeObservable(val);
					}
					return val;
				},
				set: (obj, key, val) => {
					if (
						val !== obj[key] ||
						(Array.isArray(obj) && key === "length")
					) {
						obj[key] = val;
						updateProperty(obj, key);
					}
					return true;
				},
				deleteProperty: (obj, key) => {
					updateProperty(obj, key);
					return true;
				},
			});
			manager.observables.set(dataSource, observable);
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
	makeUpdatable (call, settings = {}) {
		if (call.updatableCall) {
			return call;
		}
		let {obj, onInvalidate} = settings;
		const manager = this;
		if (obj == null) {
			obj = manager;
		}
		let updatableFunction;
		// console.warn(JSON.stringify(manager));
		let objectCallCache = manager.cache.get(obj);

		if (objectCallCache) {
			updatableFunction = objectCallCache.get(call);
		}
		else {
			objectCallCache = new Map();
			manager.cache.set(obj, objectCallCache);
		}
		if (!updatableFunction) {
			manager.valid = false;
			const updatableState = {
				valid: false,
				onInvalidate,
				value: undefined,
				deps: new Set(),
				uninit: new Map(),
			};
			updatableFunction = function () {
				if (updatableState.computing) {
					console.warn(
						`Detected cross reference inside computed properties!` +
							` "undefined" will be returned to prevent infinite loop`
					);
					return undefined;
				}
				if (manager.callStack.length) {
					updatableState.deps.add(
						manager.callStack[manager.callStack.length - 1]
							.updatableState
					);
				}

				if (updatableState.valid) {
					return updatableState.value;
				}
				updatableState.computing = true;
				updatableState.uninit.forEach(uninit => uninit(updatableState));
				updatableState.uninit.clear();

				manager.callStack.push({obj, call, updatableState});
				try {
					let context;
					if (this) {
						context = manager.observables.get(this);
					}
					else {
						context = manager;
					}
					updatableState.invalidIteration = false;
					const value = call.call(context, context);

					updatableState.valid = !updatableState.invalidIteration; // check if it was invalidated inside call
					updatableState.value = value;
					return value;
				}
				finally {
					updatableState.computing = false;
					manager.callStack.pop();
				}
			};
			updatableFunction.updatableCall = call;
			objectCallCache.set(call, updatableFunction);
		}
		return updatableFunction;
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
			get: this.makeUpdatable(callOnGet, {obj}),
			set: callOnSet,
		});
	}
	/**
	 * Создает {@link UpdatableFunction} и помещает ее в список для проверки
	 * на валидность при изменении данных. Менеджер автозапускает эту
	 * функцию если ее результат стал невалидным
	 *
	 * @param {Function} call
	 * Функция для которой будет создана {@link UpdatableFunction}
	 * Она будет автозапускатся при изменении {@link Observable} данных использованых при ее вычислении
	 * @param {Boolean} run
	 * Выполнить первый запуск реации после ее регистрации.
	 * В зависимости от указанной опции {@link ManagerOptions.immediateReaction}
	 * будет запускатся либо сразу либо по таймауту.
	 * Если {@link ManagerOptions.enabled} == false то реакция не будет
	 * выполнятся даже при установленном параметре run
	 * @return {UpdatableFunction} Управляющий объект для зарегестрированной реакции
	 */
	makeReaction (call, run = true) {
		const manager = this;
		const updatable = this.makeUpdatable(call, {
			onInvalidate: () => manager.reactionsToUpdate.add(updatable),
		});
		manager.reactionsToUpdate.add(updatable);
		if (run) {
			if (this.options.immediateReaction) {
				manager.run();
			}
			else {
				manager.runDeferred();
			}
		}
		return updatable;
	}

	/**
	 * Проверяет является ли объект наблюдаемым
	 *
	 * @param {(Observable|Object|Array)} obj
	 */
	isObservable (obj) {
		return obj[this.$isObservableSymbol] === true;
	}
	/**
	 * Запускает все автозапускаемые функции которые помечены как невалидные
	 *
	 * @param {Function} [action]
	 * Действия выполняемые внутри вызова этой функции
	 * не будут вызывать неотложный запуск реакций.
	 * Реакции будут запущены только после выхода из функции action
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
			let iterations = 0;
			while (!this.valid) {
				this.valid = true;
				if (iterations > maxIterations) {
					throw new Error("Max iterations exceeded!");
				}
				iterations++;
				[...this.reactionsToUpdate.values()].forEach(updatable => {
					this.reactionsToUpdate.delete(updatable);
					updatable();
				});
			}
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
	 * @param {Function} [action] Изменения {@link Observable} выполняемые внутри
	 * вызова этой функции не будут вызывать неотложный запуск реакций.
	 * Реакции будут запускатся после заданного таймаута
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
export const observable = Manager.default.observable;
export const reaction = Manager.default.reaction;
export const computed = Manager.default.computed;
export const updatable = Manager.default.updatable;

/**
 * @typedef ManagerOptions
 * @name ManagerOptions
 * @type {Object}
 * @property {Boolean} immediateReaction
 * Запускать реакции сразу после изменения
 * данных (по-умолчанию false - т.е. реакции выполняются по нулевому таймауту)
 * @property {Boolean} prototypes - поддержка прототипов объектов (Прототип объекта должен быть также создан как {@link Observable})
 * @property {Boolean} enabled - Активен ли менеджер данных (по-умолчнию true)
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