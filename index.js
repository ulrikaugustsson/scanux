import Rx from 'rx';

export default function (initalState = {}) {
	const masterStore = new Rx.BehaviorSubject(initalState);
	const dispatcher = new Rx.Subject();
	const actions = {};

	return {
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
}
