import sinon from "sinon";
import {Manager} from "src/index";
import {observable, computed, reaction, updatable} from "src/index";

function createTestData () {
	return {
		a: 1,
		b: 2,
		c: {
			c1: 3,
			c2: 4
		},
		d: {
			d1: {
				d11: {
					d111: {
						d1111: 100
					}
				}
			}
		},
		arr: []
	};
}

export default function runTest (test) {
	test("Check methods exists", t => {
		observable({});
		computed({}, "comp", () => {});
		reaction(() => {});
		updatable(() => {}, {});
		t.end();
	});

	test("Create observable", t => {
		const m = new Manager();
		sinon.spy(m.observables, "get");
		const data = createTestData();
		t.notOk(m.isObservable(data.d.d1.d11.d111));
		const d = m.makeObservable(data);
		t.comment("│    search for object in cache in case we already made observable for it");
		t.equal(m.observables.get.callCount, 1);
		const dsame = m.makeObservable(data);
		t.equals(d, dsame);
		m.observables.get.restore();

		sinon.spy(m.observables, "get");
		const d2 = m.makeObservable(d);
		t.comment("│    dont search object in cache if it's already observable");
		t.equal(m.observables.get.callCount, 0);
		m.observables.get.restore();

		const d4 = m.makeObservable(null);
		t.equal(d4, null);
		t.ok(m.isObservable(d.d.d1.d11.d111));
		t.notOk(m.isObservable(d.arr.map));

		const obsSrc1 = {};
		t.equal(m.makeObservable(obsSrc1).$$dataSource, obsSrc1);
		const obsSrc2 = Object.create(obsSrc1);
		t.equal(m.makeObservable(obsSrc2).$$dataSource, obsSrc2);
		t.end();
	});

	test("Create computed property", t => {
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		Object.assign(d, {
			x: "x",
			y: "y"
		});
		m.makeComputed(d, "comp1", self => self.x + self.y);
		d.comp1;
		d.x = "x1";
		d.y = "y1";
		d.comp1;

		const comp2 = sinon.spy(self => self.arr.filter(i => !i));
		const comp3 = sinon.spy(self => self.arr.filter(i => !i));
		m.makeComputed(d, "comp2", comp2);
		m.makeComputed(d, "comp3", comp3);
		d.comp2;
		d.comp3;
		t.equal(comp2.callCount, 1);
		d.arr = d.arr.concat([true, false, false]);
		d.comp2;
		t.equal(comp2.callCount, 2);
		d.arr.push(true);
		d.comp2;
		t.equal(comp2.callCount, 3);
		d.comp2;
		t.equal(comp2.callCount, 3);
		t.equal(d.comp2.length, 2);
		t.end();
	});

	test("Computed property lazyness", t => {
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		const comp = sinon.spy(self => self.a + self.b);
		m.makeComputed(d, "comp", comp);
		t.equal(comp.callCount, 0);
		d.comp;
		t.equal(comp.callCount, 1);
		d.comp;
		t.equal(comp.callCount, 1);
		d.a = 5;
		t.equal(comp.callCount, 1);
		d.comp;
		t.equal(comp.callCount, 2);
		t.end();
	});

	test("Create reaction function and unregister", t => {
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		d.a = 7;
		d.z = {};
		d.z.x = 11;
		const reaction = sinon.spy(() => {
			d.a + d.b + d.a;
		});
		t.equal(m.reactions.length, 0);
		const {unregister} = m.makeReaction(reaction);
		t.equal(m.reactions.length, 1);
		t.equal(reaction.callCount, 0);
		m.run();
		t.equal(m.reactions.length, 1);
		t.equal(reaction.callCount, 1);
		m.run();
		t.equal(m.reactions.length, 1);
		t.equal(reaction.callCount, 1);
		d.a = 3;
		d.b = 2;
		m.run();
		t.equal(m.reactions.length, 1);
		t.equal(reaction.callCount, 2);
		unregister();
		t.equal(m.reactions.length, 0);
		t.equal(reaction.callCount, 2);
		unregister();
		t.equal(m.reactions.length, 0);
		t.equal(reaction.callCount, 2);
		t.end();
	});

	test("Cross reference inside computed properties", t => {
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		m.makeComputed(d, "comp1", self => self.comp2);
		m.makeComputed(d, "comp2", self => self.comp1);
		let warnMessage;
		sinon.stub(console, "warn").callsFake(message => warnMessage = message);
		try {
			const a = d.comp2;
			t.comment("│    returned value is undefined");
			t.equal(a, undefined);
			t.comment("│    correct warn message is printed");
			t.equal(warnMessage, `Detected cross reference inside computed properties! "undefined" will be returned to prevent infinite loop`);
		}
		finally {
			console.warn.restore();
		}
		t.end();
	});

	test("Changing observable inside computed property", t => {
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		m.makeComputed(d, "comp1", self => self.a = 3);
		m.makeComputed(d, "comp2", self => self.b = 2);
		t.comment("│    changing to the new value");
		t.doesNotThrow(() => d.comp1);
		t.comment("│    changing to the same value");
		t.doesNotThrow(() => d.comp2);
		t.end();
	});

	test("Changing observable inside reaction function - positive", t => {
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		t.comment("│    changing to the new value");
		m.makeReaction(() => d.a = 3, false);
		t.doesNotThrow(() => m.run());
		t.comment("│    changing to the same value");
		m.makeReaction(() => d.b = 2, false);
		t.doesNotThrow(() => m.run());
		t.equal(d.a, 3);
		t.equal(d.b, 2);
		t.end();
	});

	test("Changing observable inside reaction function - negative", t => {
		const m = new Manager({immediateReaction: false});
		const d = m.makeObservable(createTestData());
		t.comment("│    making loop inside reaction");
		m.makeReaction(() => d.a = d.a + 2);
		t.equal(d.a, 1);
		t.throws(() => m.run());
		t.end();
	});

	test("Autorun on data change", t => {
		t.timeoutAfter(3000);
		const m = new Manager();
		const d = m.makeObservable(createTestData());
		let runCount = 0;
		m.makeReaction(() => {
			d.a + d.b;
			if (runCount === 0) {
				t.comment(`│    check initial value`);
				t.ok(d.a + d.b === 3);
			}
			else {
				t.comment("│    check value after change");
				t.ok(d.a + d.b === 5);
			}
			runCount++;
		});
		m.onAfterRun = () => {
			if (runCount >= 2) {
				t.end();
			}
		};
		setTimeout(() => d.a = 3, 100);
	});

	test("Immediate reaction option", t => {
		t.timeoutAfter(3000);
		const m = new Manager({immediateReaction: true});
		const d = m.makeObservable(createTestData());
		const reaction = sinon.spy(() => {
			d.a + d.b;
		});
		m.makeReaction(reaction, true);
		t.equal(reaction.callCount, 1);
		d.a = 12;
		t.equal(reaction.callCount, 2);
		m.run(() => {
			d.a = 13;
			d.b = 14;
		});
		t.equal(reaction.callCount, 3);
		m.onAfterRun = () => {
			t.equal(reaction.callCount, 4);
			t.end();
		};
		m.runDeferred(() => {
			d.a = 15;
			d.b = 16;
		});
		t.equal(reaction.callCount, 3);
	});

	test("Test disabled reaction", t => {
		const m = new Manager({immediateReaction: true, enabled: false});
		const d = m.makeObservable(createTestData());
		const reaction = sinon.spy(() => {
			d.a + d.b;
		});
		m.makeReaction(reaction);
		d.a = 3123;
		m.run();
		t.equal(reaction.callCount, 0);
		t.end();
	});

	test("Test disabled reaction - deferred", t => {
		t.timeoutAfter(3000);
		const m = new Manager({enabled: false});
		const d = m.makeObservable(createTestData());
		const reaction = sinon.spy(() => {
			d.a + d.b;
		});
		m.makeReaction(reaction);
		d.a = 3123;
		m.runDeferred();
		setTimeout(() => {
			t.equal(reaction.callCount, 0);
			t.end();
		}, 100);
	});

	test("Observable prototype", t => {
		const m = new Manager({immediateReaction: true});
		const src = {a: 1};
		const srcWithProto = Object.create(src);
		const protoObs = m.makeObservable(src);
		const obs = m.makeObservable(srcWithProto);
		const reaction = sinon.spy(() => obs.a);
		m.makeReaction(reaction);
		t.equal(reaction.callCount, 1);
		protoObs.a = 111;
		t.equal(reaction.callCount, 2);
		t.end();
	});

	test("Observable prototype - overriden property - reaction", t => {
		const m = new Manager({immediateReaction: true});
		function makeLongPrototypeChain (maxlength = 1, res = []) {
			if (res.length >= maxlength) {
				return res;
			}
			if (!res.length) {
				res.push({n: 0});
			}
			else {
				const obj = Object.create(res[res.length - 1]);
				obj.n = res.length;
				res.push(obj);
			}
			return makeLongPrototypeChain(maxlength, res);
		}

		const chainA = makeLongPrototypeChain(10);
		const chainB = makeLongPrototypeChain(10, chainA.slice(0, 5));
		chainA[0].a = 0;
		// chain[4].a = 4;

		const observables = {};
		observables.A0 = m.makeObservable(chainA[0]);
		observables.A3 = m.makeObservable(chainA[3]);
		observables.A6 = m.makeObservable(chainA[6]);
		observables.A8 = m.makeObservable(chainA[8]);
		observables.A9 = m.makeObservable(chainA[9]);
		observables.B6 = m.makeObservable(chainB[6]);
		observables.B7 = m.makeObservable(chainB[7]);

		const reaction1 = sinon.spy(() => `${observables.A3.a} ${observables.A9.a} ${observables.A9.a}`);
		const reaction2 = sinon.spy(() => `${observables.B7.a}`);
		m.makeReaction(reaction1);
		m.makeReaction(reaction2);
		t.equal(reaction1.callCount, 1);
		t.equal(reaction2.callCount, 1);
		observables.A0.a = 111;
		t.equal(reaction1.callCount, 2);
		t.equal(reaction2.callCount, 2);
		observables.A3.a = 12;
		t.equal(reaction1.callCount, 3);
		t.equal(reaction2.callCount, 3);
		observables.A0.a = 222;
		t.equal(reaction1.callCount, 3);
		t.equal(reaction2.callCount, 3);
		observables.A6.a = 666;
		t.equal(reaction1.callCount, 4);
		t.equal(reaction2.callCount, 3);
		observables.B6.a = 6666;
		t.equal(reaction1.callCount, 4);
		t.equal(reaction2.callCount, 4);


		t.end();
	});

	test("Forked call stack and invalidation", t => {
		const m = new Manager({immediateReaction: true});
		const d = m.makeObservable(createTestData());
		const comp = sinon.spy(self => self.a + self.b);
		m.makeComputed(d, "comp", comp);
		const comp2 = sinon.spy(self => self.comp);
		const comp3 = sinon.spy(self => self.comp);
		m.makeComputed(d, "comp2", comp2);
		m.makeComputed(d, "comp3", comp3);
		const reaction1 = sinon.spy(() => d.comp2);
		const reaction2 = sinon.spy(() => d.comp2);
		m.makeReaction(reaction1);
		m.makeReaction(reaction2);
		t.equal(reaction1.callCount, 1);
		d.a = 5123;
		t.equal(reaction1.callCount, 2);
		t.equal(reaction2.callCount, reaction1.callCount);
		t.end();
	});

	test("Whole object watcher", t => {
		const m = new Manager({immediateReaction: true, watchKey: "__watch"});
		const s1 = {};
		const o1 = m.makeObservable(s1);
		const s2 = Object.create(s1);
		const o2 = m.makeObservable(s2);
		o1.a = {};
		o2.b = 13;
		const reaction = sinon.spy(() => JSON.stringify(o2.__watch));
		t.equal(reaction.callCount, 0);
		m.makeReaction(reaction);
		t.equal(reaction.callCount, 1);
		o1.b = 212;
		t.equal(reaction.callCount, 1);
		o1.c = 555;
		t.equal(reaction.callCount, 2);
		delete o1.c;
		t.equal(reaction.callCount, 3);
		t.end();
	});



	test("Getters and setters", t => {
		const m = new Manager({immediateReaction: true});
		const s1 = {
			a: 1,
			b: "count",
			get test () {
				return `${this.b}: ${this.a}`;
			}
		};
		const o1 = m.makeObservable(s1);
		const reaction = sinon.spy(() => o1.test);
		m.makeReaction(reaction);
		t.equal(reaction.callCount, 1);
		o1.a = 5;
		t.equal(reaction.callCount, 2);
		o1.c = 212;
		t.equal(reaction.callCount, 2);
		o1.b = "mark";
		t.equal(reaction.callCount, 3);
		t.end();
	});

	test("Deep watch", t => {
		const {reaction, observable} = new Manager({immediateReaction: true});
		const srcProto = {
			a: {
				b: {
					c: "c"
				},
				b1: "b1"
			},
			a1: "a1"
		};
		const $srcProto = observable(srcProto);
		const src = Object.create(srcProto);
		const $src = observable(src);

		const r1 = sinon.spy(() => {
			$src.$$watchDeep;
		});
		reaction(r1);

		t.equal(r1.callCount, 1);
		$srcProto.a.b.m = {};
		t.equal(r1.callCount, 2);
		t.comment("test nested observable objects and watchDeep");
		$srcProto.a.b.m = $srcProto.a;
		t.equal(r1.callCount, 3);
		t.end();
	});
}
