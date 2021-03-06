var equals = function equals(v1, v2) {
    return Number.isNaN(v1) && Number.isNaN(v2) ? true : v1 === v2;
};

/**
 * Creates a new observable instance.
 * @param initialValue The initial value.
 */
function observable(initialValue) {
    var data = initialValue;
    var subscriptions = new Set();
    var observableContainer = function observableContainer(value) {
        if (arguments.length) {
            if (!equals(data, value)) {
                data = value;
                subscriptions.forEach(function (subscription) {
                    return subscription(data);
                });
            }
            return this;
        } else {
            return data;
        }
    };
    observableContainer.subscribe = function (subscription) {
        subscriptions.add(subscription);
    };
    observableContainer.unsubscribe = function (subscription) {
        subscriptions.delete(subscription);
    };
    observableContainer.unsubscribeAll = function () {
        subscriptions.clear();
    };
    observableContainer.subscriptionsCount = function () {
        return subscriptions.size;
    };
    return observableContainer;
}

var empty = {};
function computed(sources, compute) {
    var memoizedData = empty;
    var attached = false;
    var subscriptions = new Set();
    var updateData = function updateData() {
        var computedData = compute(sources.map(function (getter) {
            return getter();
        }));
        if (!equals(computedData, memoizedData)) {
            memoizedData = computedData;
            return true;
        }
        return false;
    };
    var subscription = function subscription() {
        if (updateData()) {
            subscriptions.forEach(function (subscription) {
                return subscription(memoizedData);
            });
        }
    };
    var attach = function attach() {
        sources.forEach(function (source) {
            return source.subscribe(subscription);
        });
        attached = true;
    };
    var detach = function detach() {
        sources.forEach(function (source) {
            return source.unsubscribe(subscription);
        });
        attached = false;
    };
    var checkSubscriptions = function checkSubscriptions() {
        if (subscriptions.size && !attached) {
            attach();
        } else if (!subscriptions.size && attached) {
            detach();
        }
    };
    var computedContainer = function computedContainer() {
        if (memoizedData === empty) {
            updateData();
        }
        return memoizedData;
    };
    computedContainer.subscribe = function (s) {
        subscriptions.add(s);
        checkSubscriptions();
    };
    computedContainer.unsubscribe = function (s) {
        subscriptions.delete(s);
        checkSubscriptions();
    };
    computedContainer.unsubscribeAll = function () {
        subscriptions.clear();
        checkSubscriptions();
    };
    computedContainer.subscriptionsCount = function () {
        return subscriptions.size;
    };
    return computedContainer;
}

/**
 * Creates a new throttled observable instance.
 * You can set & get the value synchronously, but the observers will be notified with a delay from the last change.
 * @param delay The delay time, in milliseconds.
 * @param initialValue The initial value.
 */
function throttled(delay, initialValue) {
    var timeout = void 0;
    var data = initialValue;
    var subscriptions = new Set();
    var updateValue = function updateValue(value) {
        data = value;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            subscriptions.forEach(function (subscription) {
                return subscription(data);
            });
        }, delay);
    };
    var observableContainer = function observableContainer(value) {
        if (arguments.length) {
            if (!equals(data, value)) {
                updateValue(value);
            }
            return this;
        } else {
            return data;
        }
    };
    observableContainer.subscribe = function (subscription) {
        subscriptions.add(subscription);
    };
    observableContainer.unsubscribe = function (subscription) {
        subscriptions.delete(subscription);
    };
    observableContainer.unsubscribeAll = function () {
        subscriptions.clear();
    };
    observableContainer.subscriptionsCount = function () {
        return subscriptions.size;
    };
    return observableContainer;
}

export { computed, throttled };export default observable;
//# sourceMappingURL=kobservable-next.js.map