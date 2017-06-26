import test from "tape";
import sinon from "sinon";
import {Manager} from "../src/index";

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

test("Check methods exists", t => {

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
	console.log(d.comp1);
	d.x = "x1";
	d.y = "y1";
	console.log(d.comp1);

	const comp2 = sinon.spy(self => self.arr.filter(i => !i));
	const comp3 = sinon.spy(self => self.arr.filter(i => !i));
	m.makeComputed(d, "comp2", comp2);
	m.makeComputed(d, "comp3", comp3);
	console.log(d.comp2);
	console.log(d.comp3);
	t.equal(comp2.callCount, 1);
	d.arr = d.arr.concat([true, false, false]);
	console.log(d.comp2);
	t.equal(comp2.callCount, 2);
	d.arr.push(true);
	console.log(d.comp2);
	t.equal(comp2.callCount, 3);
	console.log(d.comp2);
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
	console.log(d.comp);
	t.equal(comp.callCount, 1);
	console.log(d.comp);
	t.equal(comp.callCount, 1);
	d.a = 5;
	t.equal(comp.callCount, 1);
	console.log(d.comp);
	t.equal(comp.callCount, 2);
	t.end();
});

test("Create autorun function and unregister", t => {
	const m = new Manager();
	const d = m.makeObservable(createTestData());
	d.a = 7;
	d.z = {};
	d.z.x = 11;
	const autorun = sinon.spy(() => {
		console.log(d.a + d.b + d.a);
	});
	t.equal(m.autorun.length, 0);
	const {unregister} = m.makeAutorun(autorun);
	t.equal(m.autorun.length, 1);
	t.equal(autorun.callCount, 0);
	m.run();
	t.equal(m.autorun.length, 1);
	t.equal(autorun.callCount, 1);
	m.run();
	t.equal(m.autorun.length, 1);
	t.equal(autorun.callCount, 1);
	d.a = 3;
	d.b = 2;
	m.run();
	t.equal(m.autorun.length, 1);
	t.equal(autorun.callCount, 2);
	unregister();
	t.equal(m.autorun.length, 0);
	t.equal(autorun.callCount, 2);
	unregister();
	t.equal(m.autorun.length, 0);
	t.equal(autorun.callCount, 2);
	t.end();
});

test("Cross reference inside computed properties", t => {
	const m = new Manager();
	const d = m.makeObservable(createTestData());
	m.makeComputed(d, "comp1", self => self.comp2);
	m.makeComputed(d, "comp2", self => self.comp1);
	let warnMessage;
	sinon.stub(console, "warn", message => warnMessage = message);
	try {
		const a = d.comp2;
		t.comment("│    returned value is undefined");
		t.equal(a, undefined);
		t.comment("│    correct warn message is printed");
		t.equal(warnMessage, "Detected cross reference inside computed properties! undefined will be returned to prevent infinite loop");
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
	t.throws(() => d.comp1);
	t.comment("│    changing to the same value");
	t.throws(() => d.comp2);
	t.end();
});

test("Changing observable inside autorun function", t => {
	const m = new Manager();
	const d = m.makeObservable(createTestData());
	t.comment("│    changing to the new value");
	m.makeAutorun(() => d.a = 3, false);
	t.throws(() => m.run());
	t.comment("│    changing to the same value");
	m.makeAutorun(() => d.b = 2, false);
	t.throws(() => m.run());
	t.end();
});

test("Autorun on data change", t => {
	t.timeoutAfter(3000);
	const m = new Manager();
	const d = m.makeObservable(createTestData());
	let runCount = 0;
	m.makeAutorun(() => {
		console.log(d.a + d.b);
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

test("Immediate autorun option", t => {
	t.timeoutAfter(3000);
	const m = new Manager({immediateAutorun: true});
	const d = m.makeObservable(createTestData());
	const autorun = sinon.spy(() => {
		console.log(d.a + d.b);
	});
	m.makeAutorun(autorun, true);
	t.equal(autorun.callCount, 1);
	d.a = 12;
	t.equal(autorun.callCount, 2);
	m.run(() => {
		d.a = 13;
		d.b = 14;
	});
	t.equal(autorun.callCount, 3);
	m.onAfterRun = () => {
		t.equal(autorun.callCount, 4);
		t.end();
	};
	m.runDeferred(() => {
		d.a = 15;
		d.b = 16;
	});
	t.equal(autorun.callCount, 3);
});

test("Test disabled autorun", t => {
	const m = new Manager({immediateAutorun: true, enabled: false});
	const d = m.makeObservable(createTestData());
	const autorun = sinon.spy(() => {
		console.log(d.a + d.b);
	});
	m.makeAutorun(autorun);
	d.a = 3123;
	m.run();
	t.equal(autorun.callCount, 0);
	t.end();
});

test("Test disabled autorun - deferred", t => {
	t.timeoutAfter(3000);
	const m = new Manager({enabled: false});
	const d = m.makeObservable(createTestData());
	const autorun = sinon.spy(() => {
		console.log(d.a + d.b);
	});
	m.makeAutorun(autorun);
	d.a = 3123;
	m.runDeferred();
	setTimeout(() => {
		t.equal(autorun.callCount, 0);
		t.end();
	}, 100);
});
