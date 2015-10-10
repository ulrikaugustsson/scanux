import Rx from 'rx';

const masterStore = new Rx.BehaviorSubject({});
const dispatcher = new Rx.Subject();
const actions = {};

const scanux = {
	registerReducer: (actionName, reducer, initalState = {}) => {
		dispatcher
			.filter(obj => {
				return obj && obj.actionName === actionName
			})
			.map(obj => obj.observable)
			.flatMap(observable => observable)
			.scan(reducer, initalState)
			.subscribe(newState => {
				masterStore
					.onNext(newState);
			});
	},

	listen: (callback, errorHandler, onComplete) => {
		return masterStore
			.scan((prev, next) => {
				return {...prev, ...next};
			}, {})
			.subscribe(callback, errorHandler, onComplete);
	},

	addAction: (actionName, action) => {
		actions[actionName] = action;
	},

	triggerAction: (actionName, data) => {
		dispatcher.onNext({
			actionName, observable: actions[actionName](data)
		});
	}
}

export default scanux;
