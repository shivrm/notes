
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element$1('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element$1(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text$3(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$3(' ');
    }
    function empty() {
        return text$3('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // Creates a unique id for each note
    const uid = function(){
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    /* Load notes from localStorage if exists, else initialize it
     * as an empty array
     */
    var storedNotes = JSON.parse(
        localStorage.getItem('notes')
    ) || [];

    // Shared variable that stores all notes
    const notes = writable(storedNotes);

    var notesArr; // Variable used for modifying the notes store
    notes.subscribe((value) => {
        // Save notes to localStorage whenever a change occurs
        localStorage.setItem(
            'notes',
            JSON.stringify(value)
        );

        // Update the notesArr value every time the notes store is changes
        notesArr = value;
    });

    // Function which returns the note that is currently being edited 
    var getEditNote = () => notesArr[get_store_value(appState).editNoteIndex];

    // Function to add a new note
    function addNote(noteData) {
        noteData.id = uid(); // Generate an ID for the note
        
        var notesCopy = notesArr;
        notesCopy.push(noteData); // Add the new note to the array
        notes.set(notesCopy); // Sets the store to the new value
    }

    // Function to delete a note, given its index
    function deleteNote(index) {
        var notesCopy = notesArr;
        notesCopy.splice(index, 1); // Remove the note from the copy
        notes.set(notesCopy); // Sets the store to the new value
    }

    /* Overrides the properties of the note currently being edited,
     * given a object containing properties to override
     */
    function editNote(newProps) {
        // Variable that stores the index of the note being edited
        var index = get_store_value(appState).editNoteIndex;
        
        var notesCopy = notesArr;   // Create a copy of the notes
        var note = notesArr[index]; // The note being edited

        // Override the old props of the note with the new props
        notesCopy[index] = {...note, ...newProps};
        notes.set(notesCopy); // Set the store to the new value
    }

    // Variable that stores the current state of the app
    const appState = writable({
        editorOpen: false,          // If the note editor is open
        editNoteIndex: undefined    // The index of the note being edited
    });

    /// <reference lib="dom" />

    /* eslint-env browser */

    const element = document.createElement('i');

    /**
     * @param {string} value
     * @returns {string|false}
     */
    function decodeEntity(value) {
      const characterReference = '&' + value + ';';
      element.innerHTML = characterReference;
      const char = element.textContent;

      // Some named character references do not require the closing semicolon
      // (`&not`, for instance), which leads to situations where parsing the assumed
      // named reference of `&notit;` will result in the string `¬it;`.
      // When we encounter a trailing semicolon after parsing, and the character
      // reference to decode was not a semicolon (`&semi;`), we can assume that the
      // matching was not complete.
      // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
      // yield `null`.
      if (char.charCodeAt(char.length - 1) === 59 /* `;` */ && value !== 'semi') {
        return false
      }

      // If the decoded string is equal to the input, the character reference was
      // not valid.
      // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
      // yield `null`.
      return char === characterReference ? false : char
    }

    /**
     * Like `Array#splice`, but smarter for giant arrays.
     *
     * `Array#splice` takes all items to be inserted as individual argument which
     * causes a stack overflow in V8 when trying to insert 100k items for instance.
     *
     * Otherwise, this does not return the removed items, and takes `items` as an
     * array instead of rest parameters.
     *
     * @template {unknown} T
     * @param {T[]} list
     * @param {number} start
     * @param {number} remove
     * @param {T[]} items
     * @returns {void}
     */
    function splice(list, start, remove, items) {
      const end = list.length;
      let chunkStart = 0;
      /** @type {unknown[]} */

      let parameters; // Make start between zero and `end` (included).

      if (start < 0) {
        start = -start > end ? 0 : end + start;
      } else {
        start = start > end ? end : start;
      }

      remove = remove > 0 ? remove : 0; // No need to chunk the items if there’s only a couple (10k) items.

      if (items.length < 10000) {
        parameters = Array.from(items);
        parameters.unshift(start, remove) // @ts-expect-error Hush, it’s fine.
        ;[].splice.apply(list, parameters);
      } else {
        // Delete `remove` items starting from `start`
        if (remove) [].splice.apply(list, [start, remove]); // Insert the items in chunks to not cause stack overflows.

        while (chunkStart < items.length) {
          parameters = items.slice(chunkStart, chunkStart + 10000);
          parameters.unshift(start, 0) // @ts-expect-error Hush, it’s fine.
          ;[].splice.apply(list, parameters);
          chunkStart += 10000;
          start += 10000;
        }
      }
    }
    /**
     * Append `items` (an array) at the end of `list` (another array).
     * When `list` was empty, returns `items` instead.
     *
     * This prevents a potentially expensive operation when `list` is empty,
     * and adds items in batches to prevent V8 from hanging.
     *
     * @template {unknown} T
     * @param {T[]} list
     * @param {T[]} items
     * @returns {T[]}
     */

    function push(list, items) {
      if (list.length > 0) {
        splice(list, list.length, 0, items);
        return list
      }

      return items
    }

    /**
     * @typedef {import('micromark-util-types').NormalizedExtension} NormalizedExtension
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     */

    const hasOwnProperty$1 = {}.hasOwnProperty;

    /**
     * Combine several syntax extensions into one.
     *
     * @param {Extension[]} extensions List of syntax extensions.
     * @returns {NormalizedExtension} A single combined extension.
     */
    function combineExtensions(extensions) {
      /** @type {NormalizedExtension} */
      const all = {};
      let index = -1;

      while (++index < extensions.length) {
        syntaxExtension(all, extensions[index]);
      }

      return all
    }

    /**
     * Merge `extension` into `all`.
     *
     * @param {NormalizedExtension} all Extension to merge into.
     * @param {Extension} extension Extension to merge.
     * @returns {void}
     */
    function syntaxExtension(all, extension) {
      /** @type {string} */
      let hook;

      for (hook in extension) {
        const maybe = hasOwnProperty$1.call(all, hook) ? all[hook] : undefined;
        const left = maybe || (all[hook] = {});
        const right = extension[hook];
        /** @type {string} */
        let code;

        for (code in right) {
          if (!hasOwnProperty$1.call(left, code)) left[code] = [];
          const value = right[code];
          constructs(
            // @ts-expect-error Looks like a list.
            left[code],
            Array.isArray(value) ? value : value ? [value] : []
          );
        }
      }
    }

    /**
     * Merge `list` into `existing` (both lists of constructs).
     * Mutates `existing`.
     *
     * @param {unknown[]} existing
     * @param {unknown[]} list
     * @returns {void}
     */
    function constructs(existing, list) {
      let index = -1;
      /** @type {unknown[]} */
      const before = [];

      while (++index < list.length) {
    (list[index].add === 'after' ? existing : before).push(list[index]);
      }

      splice(existing, 0, 0, before);
    }

    /**
     * Combine several HTML extensions into one.
     *
     * @param {HtmlExtension[]} htmlExtensions List of HTML extensions.
     * @returns {HtmlExtension} A single combined extension.
     */
    function combineHtmlExtensions(htmlExtensions) {
      /** @type {HtmlExtension} */
      const handlers = {};
      let index = -1;

      while (++index < htmlExtensions.length) {
        htmlExtension(handlers, htmlExtensions[index]);
      }

      return handlers
    }

    /**
     * Merge `extension` into `all`.
     *
     * @param {HtmlExtension} all Extension to merge into.
     * @param {HtmlExtension} extension Extension to merge.
     * @returns {void}
     */
    function htmlExtension(all, extension) {
      /** @type {string} */
      let hook;

      for (hook in extension) {
        const maybe = hasOwnProperty$1.call(all, hook) ? all[hook] : undefined;
        const left = maybe || (all[hook] = {});
        const right = extension[hook];
        /** @type {string} */
        let type;

        if (right) {
          for (type in right) {
            left[type] = right[type];
          }
        }
      }
    }

    /**
     * Turn the number (in string form as either hexa- or plain decimal) coming from
     * a numeric character reference into a character.
     *
     * @param {string} value
     *   Value to decode.
     * @param {number} base
     *   Numeric base.
     * @returns {string}
     */
    function decodeNumericCharacterReference(value, base) {
      const code = Number.parseInt(value, base);

      if (
        // C0 except for HT, LF, FF, CR, space
        code < 9 ||
        code === 11 ||
        (code > 13 && code < 32) || // Control character (DEL) of the basic block and C1 controls.
        (code > 126 && code < 160) || // Lone high surrogates and low surrogates.
        (code > 55295 && code < 57344) || // Noncharacters.
        (code > 64975 && code < 65008) ||
        (code & 65535) === 65535 ||
        (code & 65535) === 65534 || // Out of range
        code > 1114111
      ) {
        return '\uFFFD'
      }

      return String.fromCharCode(code)
    }

    const characterReferences = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt'};

    /**
     * Encode only the dangerous HTML characters.
     *
     * This ensures that certain characters which have special meaning in HTML are
     * dealt with.
     * Technically, we can skip `>` and `"` in many cases, but CM includes them.
     *
     * @param {string} value
     * @returns {string}
     */
    function encode(value) {
      return value.replace(/["&<>]/g, replace)

      /**
       * @param {string} value
       * @returns {string}
       */
      function replace(value) {
        // @ts-expect-error Hush, it’s fine.
        return '&' + characterReferences[value] + ';'
      }
    }

    /**
     * Normalize an identifier (such as used in definitions).
     *
     * @param {string} value
     * @returns {string}
     */
    function normalizeIdentifier(value) {
      return (
        value // Collapse Markdown whitespace.
          .replace(/[\t\n\r ]+/g, ' ') // Trim.
          .replace(/^ | $/g, '') // Some characters are considered “uppercase”, but if their lowercase
          // counterpart is uppercased will result in a different uppercase
          // character.
          // Hence, to get that form, we perform both lower- and uppercase.
          // Upper case makes sure keys will not interact with default prototypal
          // methods: no method is uppercase.
          .toLowerCase()
          .toUpperCase()
      )
    }

    // This module is generated by `script/`.
    //
    // CommonMark handles attention (emphasis, strong) markers based on what comes
    // before or after them.
    // One such difference is if those characters are Unicode punctuation.
    // This script is generated from the Unicode data.
    const unicodePunctuationRegex =
      /[!-/:-@[-`{-~\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/;

    /**
     * @typedef {import('micromark-util-types').Code} Code
     */
    /**
     * Check whether the character code represents an ASCII alpha (`a` through `z`,
     * case insensitive).
     *
     * An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
     *
     * An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
     * to U+005A (`Z`).
     *
     * An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
     * to U+007A (`z`).
     */

    const asciiAlpha = regexCheck(/[A-Za-z]/);
    /**
     * Check whether the character code represents an ASCII digit (`0` through `9`).
     *
     * An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
     * U+0039 (`9`).
     */

    const asciiDigit = regexCheck(/\d/);
    /**
     * Check whether the character code represents an ASCII hex digit (`a` through
     * `f`, case insensitive, or `0` through `9`).
     *
     * An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
     * digit, or an ASCII lower hex digit.
     *
     * An **ASCII upper hex digit** is a character in the inclusive range U+0041
     * (`A`) to U+0046 (`F`).
     *
     * An **ASCII lower hex digit** is a character in the inclusive range U+0061
     * (`a`) to U+0066 (`f`).
     */

    const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
    /**
     * Check whether the character code represents an ASCII alphanumeric (`a`
     * through `z`, case insensitive, or `0` through `9`).
     *
     * An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
     * (see `asciiAlpha`).
     */

    const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
    /**
     * Check whether the character code represents ASCII punctuation.
     *
     * An **ASCII punctuation** is a character in the inclusive ranges U+0021
     * EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
     * SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
     * (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
     */

    const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
    /**
     * Check whether the character code represents an ASCII atext.
     *
     * atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
     * the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
     * U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
     * SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
     * CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
     * (`{`) to U+007E TILDE (`~`).
     *
     * See:
     * **\[RFC5322]**:
     * [Internet Message Format](https://tools.ietf.org/html/rfc5322).
     * P. Resnick.
     * IETF.
     */

    const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
    /**
     * Check whether a character code is an ASCII control character.
     *
     * An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
     * to U+001F (US), or U+007F (DEL).
     *
     * @param {Code} code
     * @returns {code is number}
     */

    function asciiControl(code) {
      return (
        // Special whitespace codes (which have negative values), C0 and Control
        // character DEL
        code !== null && (code < 32 || code === 127)
      )
    }
    /**
     * Check whether a character code is a markdown line ending (see
     * `markdownLineEnding`) or markdown space (see `markdownSpace`).
     *
     * @param {Code} code
     * @returns {code is number}
     */

    function markdownLineEndingOrSpace(code) {
      return code !== null && (code < 0 || code === 32)
    }
    /**
     * Check whether a character code is a markdown line ending.
     *
     * A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
     * LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
     *
     * In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
     * RETURN (CR) are replaced by these virtual characters depending on whether
     * they occurred together.
     *
     * @param {Code} code
     * @returns {code is number}
     */

    function markdownLineEnding(code) {
      return code !== null && code < -2
    }
    /**
     * Check whether a character code is a markdown space.
     *
     * A **markdown space** is the concrete character U+0020 SPACE (SP) and the
     * virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
     *
     * In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
     * replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
     * SPACE (VS) characters, depending on the column at which the tab occurred.
     *
     * @param {Code} code
     * @returns {code is number}
     */

    function markdownSpace(code) {
      return code === -2 || code === -1 || code === 32
    }
    /**
     * Check whether the character code represents Unicode whitespace.
     *
     * Note that this does handle micromark specific markdown whitespace characters.
     * See `markdownLineEndingOrSpace` to check that.
     *
     * A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
     * Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
     * U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
     *
     * See:
     * **\[UNICODE]**:
     * [The Unicode Standard](https://www.unicode.org/versions/).
     * Unicode Consortium.
     */

    const unicodeWhitespace = regexCheck(/\s/);
    /**
     * Check whether the character code represents Unicode punctuation.
     *
     * A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
     * Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
     * (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
     * (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
     * punctuation (see `asciiPunctuation`).
     *
     * See:
     * **\[UNICODE]**:
     * [The Unicode Standard](https://www.unicode.org/versions/).
     * Unicode Consortium.
     */
    // Size note: removing ASCII from the regex and using `asciiPunctuation` here
    // In fact adds to the bundle size.

    const unicodePunctuation = regexCheck(unicodePunctuationRegex);
    /**
     * Create a code check from a regex.
     *
     * @param {RegExp} regex
     * @returns {(code: Code) => code is number}
     */

    function regexCheck(regex) {
      return check
      /**
       * Check whether a code matches the bound regex.
       *
       * @param {Code} code Character code
       * @returns {code is number} Whether the character code matches the bound regex
       */

      function check(code) {
        return code !== null && regex.test(String.fromCharCode(code))
      }
    }

    /**
     * Make a value safe for injection as a URL.
     *
     * This encodes unsafe characters with percent-encoding and skips already
     * encoded sequences (see `normalizeUri` below).
     * Further unsafe characters are encoded as character references (see
     * `micromark-util-encode`).
     *
     * Then, a regex of allowed protocols can be given, in which case the URL is
     * sanitized.
     * For example, `/^(https?|ircs?|mailto|xmpp)$/i` can be used for `a[href]`,
     * or `/^https?$/i` for `img[src]`.
     * If the URL includes an unknown protocol (one not matched by `protocol`, such
     * as a dangerous example, `javascript:`), the value is ignored.
     *
     * @param {string|undefined} url
     * @param {RegExp} [protocol]
     * @returns {string}
     */
    function sanitizeUri(url, protocol) {
      const value = encode(normalizeUri(url || ''));

      if (!protocol) {
        return value
      }

      const colon = value.indexOf(':');
      const questionMark = value.indexOf('?');
      const numberSign = value.indexOf('#');
      const slash = value.indexOf('/');

      if (
        // If there is no protocol, it’s relative.
        colon < 0 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
        (slash > -1 && colon > slash) ||
        (questionMark > -1 && colon > questionMark) ||
        (numberSign > -1 && colon > numberSign) || // It is a protocol, it should be allowed.
        protocol.test(value.slice(0, colon))
      ) {
        return value
      }

      return ''
    }
    /**
     * Normalize a URL (such as used in definitions).
     *
     * Encode unsafe characters with percent-encoding, skipping already encoded
     * sequences.
     *
     * @param {string} value
     * @returns {string}
     */

    function normalizeUri(value) {
      /** @type {string[]} */
      const result = [];
      let index = -1;
      let start = 0;
      let skip = 0;

      while (++index < value.length) {
        const code = value.charCodeAt(index);
        /** @type {string} */

        let replace = ''; // A correct percent encoded value.

        if (
          code === 37 &&
          asciiAlphanumeric(value.charCodeAt(index + 1)) &&
          asciiAlphanumeric(value.charCodeAt(index + 2))
        ) {
          skip = 2;
        } // ASCII.
        else if (code < 128) {
          if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code))) {
            replace = String.fromCharCode(code);
          }
        } // Astral.
        else if (code > 55295 && code < 57344) {
          const next = value.charCodeAt(index + 1); // A correct surrogate pair.

          if (code < 56320 && next > 56319 && next < 57344) {
            replace = String.fromCharCode(code, next);
            skip = 1;
          } // Lone surrogate.
          else {
            replace = '\uFFFD';
          }
        } // Unicode.
        else {
          replace = String.fromCharCode(code);
        }

        if (replace) {
          result.push(value.slice(start, index), encodeURIComponent(replace));
          start = index + skip + 1;
          replace = '';
        }

        if (skip) {
          index += skip;
          skip = 0;
        }
      }

      return result.join('') + value.slice(start)
    }

    /**
     * While micromark is a lexer/tokenizer, the common case of going from markdown
     * to html is currently built in as this module, even though the parts can be
     * used separately to build ASTs, CSTs, or many other output formats.
     *
     * Having an HTML compiler built in is useful because it allows us to check for
     * compliancy to CommonMark, the de facto norm of markdown, specified in roughly
     * 600 input/output cases.
     *
     * This module has an interface that accepts lists of events instead of the
     * whole at once, however, because markdown can’t be truly streaming, we buffer
     * events before processing and outputting the final result.
     */
    const hasOwnProperty = {}.hasOwnProperty;
    /**
     * These two are allowlists of safe protocols for full URLs in respectively the
     * `href` (on `<a>`) and `src` (on `<img>`) attributes.
     * They are based on what is allowed on GitHub,
     * <https://github.com/syntax-tree/hast-util-sanitize/blob/9275b21/lib/github.json#L31>
     */

    const protocolHref = /^(https?|ircs?|mailto|xmpp)$/i;
    const protocolSrc = /^https?$/i;
    /**
     * @param {CompileOptions} [options]
     * @returns {Compile}
     */

    function compile(options = {}) {
      /**
       * Tags is needed because according to markdown, links and emphasis and
       * whatnot can exist in images, however, as HTML doesn’t allow content in
       * images, the tags are ignored in the `alt` attribute, but the content
       * remains.
       *
       * @type {boolean|undefined}
       */
      let tags = true;
      /**
       * An object to track identifiers to media (URLs and titles) defined with
       * definitions.
       *
       * @type {Record<string, Definition>}
       */

      const definitions = {};
      /**
       * A lot of the handlers need to capture some of the output data, modify it
       * somehow, and then deal with it.
       * We do that by tracking a stack of buffers, that can be opened (with
       * `buffer`) and closed (with `resume`) to access them.
       *
       * @type {string[][]}
       */

      const buffers = [[]];
      /**
       * As we can have links in images and the other way around, where the deepest
       * ones are closed first, we need to track which one we’re in.
       *
       * @type {Media[]}
       */

      const mediaStack = [];
      /**
       * Same as `mediaStack` for tightness, which is specific to lists.
       * We need to track if we’re currently in a tight or loose container.
       *
       * @type {boolean[]}
       */

      const tightStack = [];
      /** @type {HtmlExtension} */

      const defaultHandlers = {
        enter: {
          blockQuote: onenterblockquote,
          codeFenced: onentercodefenced,
          codeFencedFenceInfo: buffer,
          codeFencedFenceMeta: buffer,
          codeIndented: onentercodeindented,
          codeText: onentercodetext,
          content: onentercontent,
          definition: onenterdefinition,
          definitionDestinationString: onenterdefinitiondestinationstring,
          definitionLabelString: buffer,
          definitionTitleString: buffer,
          emphasis: onenteremphasis,
          htmlFlow: onenterhtmlflow,
          htmlText: onenterhtml,
          image: onenterimage,
          label: buffer,
          link: onenterlink,
          listItemMarker: onenterlistitemmarker,
          listItemValue: onenterlistitemvalue,
          listOrdered: onenterlistordered,
          listUnordered: onenterlistunordered,
          paragraph: onenterparagraph,
          reference: buffer,
          resource: onenterresource,
          resourceDestinationString: onenterresourcedestinationstring,
          resourceTitleString: buffer,
          setextHeading: onentersetextheading,
          strong: onenterstrong
        },
        exit: {
          atxHeading: onexitatxheading,
          atxHeadingSequence: onexitatxheadingsequence,
          autolinkEmail: onexitautolinkemail,
          autolinkProtocol: onexitautolinkprotocol,
          blockQuote: onexitblockquote,
          characterEscapeValue: onexitdata,
          characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
          characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
          characterReferenceValue: onexitcharacterreferencevalue,
          codeFenced: onexitflowcode,
          codeFencedFence: onexitcodefencedfence,
          codeFencedFenceInfo: onexitcodefencedfenceinfo,
          codeFencedFenceMeta: resume,
          codeFlowValue: onexitcodeflowvalue,
          codeIndented: onexitflowcode,
          codeText: onexitcodetext,
          codeTextData: onexitdata,
          data: onexitdata,
          definition: onexitdefinition,
          definitionDestinationString: onexitdefinitiondestinationstring,
          definitionLabelString: onexitdefinitionlabelstring,
          definitionTitleString: onexitdefinitiontitlestring,
          emphasis: onexitemphasis,
          hardBreakEscape: onexithardbreak,
          hardBreakTrailing: onexithardbreak,
          htmlFlow: onexithtml,
          htmlFlowData: onexitdata,
          htmlText: onexithtml,
          htmlTextData: onexitdata,
          image: onexitmedia,
          label: onexitlabel,
          labelText: onexitlabeltext,
          lineEnding: onexitlineending,
          link: onexitmedia,
          listOrdered: onexitlistordered,
          listUnordered: onexitlistunordered,
          paragraph: onexitparagraph,
          reference: resume,
          referenceString: onexitreferencestring,
          resource: resume,
          resourceDestinationString: onexitresourcedestinationstring,
          resourceTitleString: onexitresourcetitlestring,
          setextHeading: onexitsetextheading,
          setextHeadingLineSequence: onexitsetextheadinglinesequence,
          setextHeadingText: onexitsetextheadingtext,
          strong: onexitstrong,
          thematicBreak: onexitthematicbreak
        }
      };
      /**
       * Combine the HTML extensions with the default handlers.
       * An HTML extension is an object whose fields are either `enter` or `exit`
       * (reflecting whether a token is entered or exited).
       * The values at such objects are names of tokens mapping to handlers.
       * Handlers are called, respectively when a token is opener or closed, with
       * that token, and a context as `this`.
       *
       * @type {NormalizedHtmlExtension}
       */
      // @ts-expect-error `defaultHandlers` is full, so the result will be too.

      const handlers = combineHtmlExtensions(
        [defaultHandlers].concat(options.htmlExtensions || [])
      );
      /**
       * Handlers do often need to keep track of some state.
       * That state is provided here as a key-value store (an object).
       *
       * @type {CompileData}
       */

      const data = {
        tightStack
      };
      /**
       * The context for handlers references a couple of useful functions.
       * In handlers from extensions, those can be accessed at `this`.
       * For the handlers here, they can be accessed directly.
       *
       * @type {Omit<CompileContext, 'sliceSerialize'>}
       */

      const context = {
        lineEndingIfNeeded,
        options,
        encode: encode$1,
        raw,
        tag,
        buffer,
        resume,
        setData,
        getData
      };
      /**
       * Generally, micromark copies line endings (`'\r'`, `'\n'`, `'\r\n'`) in the
       * markdown document over to the compiled HTML.
       * In some cases, such as `> a`, CommonMark requires that extra line endings
       * are added: `<blockquote>\n<p>a</p>\n</blockquote>`.
       * This variable hold the default line ending when given (or `undefined`),
       * and in the latter case will be updated to the first found line ending if
       * there is one.
       */

      let lineEndingStyle = options.defaultLineEnding; // Return the function that handles a slice of events.

      return compile
      /**
       * Deal w/ a slice of events.
       * Return either the empty string if there’s nothing of note to return, or the
       * result when done.
       *
       * @param {Event[]} events
       * @returns {string}
       */

      function compile(events) {
        let index = -1;
        let start = 0;
        /** @type {number[]} */

        const listStack = []; // As definitions can come after references, we need to figure out the media
        // (urls and titles) defined by them before handling the references.
        // So, we do sort of what HTML does: put metadata at the start (in head), and
        // then put content after (`body`).

        /** @type {Event[]} */

        let head = [];
        /** @type {Event[]} */

        let body = [];

        while (++index < events.length) {
          // Figure out the line ending style used in the document.
          if (
            !lineEndingStyle &&
            (events[index][1].type === 'lineEnding' ||
              events[index][1].type === 'lineEndingBlank')
          ) {
            // @ts-expect-error Hush, it’s a line ending.
            lineEndingStyle = events[index][2].sliceSerialize(events[index][1]);
          } // Preprocess lists to infer whether the list is loose or not.

          if (
            events[index][1].type === 'listOrdered' ||
            events[index][1].type === 'listUnordered'
          ) {
            if (events[index][0] === 'enter') {
              listStack.push(index);
            } else {
              prepareList(events.slice(listStack.pop(), index));
            }
          } // Move definitions to the front.

          if (events[index][1].type === 'definition') {
            if (events[index][0] === 'enter') {
              body = push(body, events.slice(start, index));
              start = index;
            } else {
              head = push(head, events.slice(start, index + 1));
              start = index + 1;
            }
          }
        }

        head = push(head, body);
        head = push(head, events.slice(start));
        index = -1;
        const result = head; // Handle the start of the document, if defined.

        if (handlers.enter.null) {
          handlers.enter.null.call(context);
        } // Handle all events.

        while (++index < events.length) {
          const handler = handlers[result[index][0]];

          if (hasOwnProperty.call(handler, result[index][1].type)) {
            handler[result[index][1].type].call(
              Object.assign(
                {
                  sliceSerialize: result[index][2].sliceSerialize
                },
                context
              ),
              result[index][1]
            );
          }
        } // Handle the end of the document, if defined.

        if (handlers.exit.null) {
          handlers.exit.null.call(context);
        }

        return buffers[0].join('')
      }
      /**
       * Figure out whether lists are loose or not.
       *
       * @param {Event[]} slice
       * @returns {void}
       */

      function prepareList(slice) {
        const length = slice.length;
        let index = 0; // Skip open.

        let containerBalance = 0;
        let loose = false;
        /** @type {boolean|undefined} */

        let atMarker;

        while (++index < length) {
          const event = slice[index];

          if (event[1]._container) {
            atMarker = undefined;

            if (event[0] === 'enter') {
              containerBalance++;
            } else {
              containerBalance--;
            }
          } else
            switch (event[1].type) {
              case 'listItemPrefix': {
                if (event[0] === 'exit') {
                  atMarker = true;
                }

                break
              }

              case 'linePrefix': {
                // Ignore
                break
              }

              case 'lineEndingBlank': {
                if (event[0] === 'enter' && !containerBalance) {
                  if (atMarker) {
                    atMarker = undefined;
                  } else {
                    loose = true;
                  }
                }

                break
              }

              default: {
                atMarker = undefined;
              }
            }
        }

        slice[0][1]._loose = loose;
      }
      /**
       * @type {CompileContext['setData']}
       * @param [value]
       */

      function setData(key, value) {
        data[key] = value;
      }
      /**
       * @type {CompileContext['getData']}
       * @template {string} K
       * @param {K} key
       * @returns {CompileData[K]}
       */

      function getData(key) {
        return data[key]
      }
      /** @type {CompileContext['buffer']} */

      function buffer() {
        buffers.push([]);
      }
      /** @type {CompileContext['resume']} */

      function resume() {
        const buf = buffers.pop();
        return buf.join('')
      }
      /** @type {CompileContext['tag']} */

      function tag(value) {
        if (!tags) return
        setData('lastWasTag', true);
        buffers[buffers.length - 1].push(value);
      }
      /** @type {CompileContext['raw']} */

      function raw(value) {
        setData('lastWasTag');
        buffers[buffers.length - 1].push(value);
      }
      /**
       * Output an extra line ending.
       *
       * @returns {void}
       */

      function lineEnding() {
        raw(lineEndingStyle || '\n');
      }
      /** @type {CompileContext['lineEndingIfNeeded']} */

      function lineEndingIfNeeded() {
        const buffer = buffers[buffers.length - 1];
        const slice = buffer[buffer.length - 1];
        const previous = slice ? slice.charCodeAt(slice.length - 1) : null;

        if (previous === 10 || previous === 13 || previous === null) {
          return
        }

        lineEnding();
      }
      /** @type {CompileContext['encode']} */

      function encode$1(value) {
        return getData('ignoreEncode') ? value : encode(value)
      } //
      // Handlers.
      //

      /** @type {Handle} */

      function onenterlistordered(token) {
        tightStack.push(!token._loose);
        lineEndingIfNeeded();
        tag('<ol');
        setData('expectFirstItem', true);
      }
      /** @type {Handle} */

      function onenterlistunordered(token) {
        tightStack.push(!token._loose);
        lineEndingIfNeeded();
        tag('<ul');
        setData('expectFirstItem', true);
      }
      /** @type {Handle} */

      function onenterlistitemvalue(token) {
        if (getData('expectFirstItem')) {
          const value = Number.parseInt(this.sliceSerialize(token), 10);

          if (value !== 1) {
            tag(' start="' + encode$1(String(value)) + '"');
          }
        }
      }
      /** @type {Handle} */

      function onenterlistitemmarker() {
        if (getData('expectFirstItem')) {
          tag('>');
        } else {
          onexitlistitem();
        }

        lineEndingIfNeeded();
        tag('<li>');
        setData('expectFirstItem'); // “Hack” to prevent a line ending from showing up if the item is empty.

        setData('lastWasTag');
      }
      /** @type {Handle} */

      function onexitlistordered() {
        onexitlistitem();
        tightStack.pop();
        lineEnding();
        tag('</ol>');
      }
      /** @type {Handle} */

      function onexitlistunordered() {
        onexitlistitem();
        tightStack.pop();
        lineEnding();
        tag('</ul>');
      }
      /** @type {Handle} */

      function onexitlistitem() {
        if (getData('lastWasTag') && !getData('slurpAllLineEndings')) {
          lineEndingIfNeeded();
        }

        tag('</li>');
        setData('slurpAllLineEndings');
      }
      /** @type {Handle} */

      function onenterblockquote() {
        tightStack.push(false);
        lineEndingIfNeeded();
        tag('<blockquote>');
      }
      /** @type {Handle} */

      function onexitblockquote() {
        tightStack.pop();
        lineEndingIfNeeded();
        tag('</blockquote>');
        setData('slurpAllLineEndings');
      }
      /** @type {Handle} */

      function onenterparagraph() {
        if (!tightStack[tightStack.length - 1]) {
          lineEndingIfNeeded();
          tag('<p>');
        }

        setData('slurpAllLineEndings');
      }
      /** @type {Handle} */

      function onexitparagraph() {
        if (tightStack[tightStack.length - 1]) {
          setData('slurpAllLineEndings', true);
        } else {
          tag('</p>');
        }
      }
      /** @type {Handle} */

      function onentercodefenced() {
        lineEndingIfNeeded();
        tag('<pre><code');
        setData('fencesCount', 0);
      }
      /** @type {Handle} */

      function onexitcodefencedfenceinfo() {
        const value = resume();
        tag(' class="language-' + value + '"');
      }
      /** @type {Handle} */

      function onexitcodefencedfence() {
        const count = getData('fencesCount') || 0;

        if (!count) {
          tag('>');
          setData('slurpOneLineEnding', true);
        }

        setData('fencesCount', count + 1);
      }
      /** @type {Handle} */

      function onentercodeindented() {
        lineEndingIfNeeded();
        tag('<pre><code>');
      }
      /** @type {Handle} */

      function onexitflowcode() {
        const count = getData('fencesCount'); // One special case is if we are inside a container, and the fenced code was
        // not closed (meaning it runs to the end).
        // In that case, the following line ending, is considered *outside* the
        // fenced code and block quote by micromark, but CM wants to treat that
        // ending as part of the code.

        if (
          count !== undefined &&
          count < 2 && // @ts-expect-error `tightStack` is always set.
          data.tightStack.length > 0 &&
          !getData('lastWasTag')
        ) {
          lineEnding();
        } // But in most cases, it’s simpler: when we’ve seen some data, emit an extra
        // line ending when needed.

        if (getData('flowCodeSeenData')) {
          lineEndingIfNeeded();
        }

        tag('</code></pre>');
        if (count !== undefined && count < 2) lineEndingIfNeeded();
        setData('flowCodeSeenData');
        setData('fencesCount');
        setData('slurpOneLineEnding');
      }
      /** @type {Handle} */

      function onenterimage() {
        mediaStack.push({
          image: true
        });
        tags = undefined; // Disallow tags.
      }
      /** @type {Handle} */

      function onenterlink() {
        mediaStack.push({});
      }
      /** @type {Handle} */

      function onexitlabeltext(token) {
        mediaStack[mediaStack.length - 1].labelId = this.sliceSerialize(token);
      }
      /** @type {Handle} */

      function onexitlabel() {
        mediaStack[mediaStack.length - 1].label = resume();
      }
      /** @type {Handle} */

      function onexitreferencestring(token) {
        mediaStack[mediaStack.length - 1].referenceId = this.sliceSerialize(token);
      }
      /** @type {Handle} */

      function onenterresource() {
        buffer(); // We can have line endings in the resource, ignore them.

        mediaStack[mediaStack.length - 1].destination = '';
      }
      /** @type {Handle} */

      function onenterresourcedestinationstring() {
        buffer(); // Ignore encoding the result, as we’ll first percent encode the url and
        // encode manually after.

        setData('ignoreEncode', true);
      }
      /** @type {Handle} */

      function onexitresourcedestinationstring() {
        mediaStack[mediaStack.length - 1].destination = resume();
        setData('ignoreEncode');
      }
      /** @type {Handle} */

      function onexitresourcetitlestring() {
        mediaStack[mediaStack.length - 1].title = resume();
      }
      /** @type {Handle} */

      function onexitmedia() {
        let index = mediaStack.length - 1; // Skip current.

        const media = mediaStack[index];
        const id = media.referenceId || media.labelId;
        const context =
          media.destination === undefined
            ? definitions[normalizeIdentifier(id)]
            : media;
        tags = true;

        while (index--) {
          if (mediaStack[index].image) {
            tags = undefined;
            break
          }
        }

        if (media.image) {
          tag(
            '<img src="' +
              sanitizeUri(
                context.destination,
                options.allowDangerousProtocol ? undefined : protocolSrc
              ) +
              '" alt="'
          );
          raw(media.label);
          tag('"');
        } else {
          tag(
            '<a href="' +
              sanitizeUri(
                context.destination,
                options.allowDangerousProtocol ? undefined : protocolHref
              ) +
              '"'
          );
        }

        tag(context.title ? ' title="' + context.title + '"' : '');

        if (media.image) {
          tag(' />');
        } else {
          tag('>');
          raw(media.label);
          tag('</a>');
        }

        mediaStack.pop();
      }
      /** @type {Handle} */

      function onenterdefinition() {
        buffer();
        mediaStack.push({});
      }
      /** @type {Handle} */

      function onexitdefinitionlabelstring(token) {
        // Discard label, use the source content instead.
        resume();
        mediaStack[mediaStack.length - 1].labelId = this.sliceSerialize(token);
      }
      /** @type {Handle} */

      function onenterdefinitiondestinationstring() {
        buffer();
        setData('ignoreEncode', true);
      }
      /** @type {Handle} */

      function onexitdefinitiondestinationstring() {
        mediaStack[mediaStack.length - 1].destination = resume();
        setData('ignoreEncode');
      }
      /** @type {Handle} */

      function onexitdefinitiontitlestring() {
        mediaStack[mediaStack.length - 1].title = resume();
      }
      /** @type {Handle} */

      function onexitdefinition() {
        const media = mediaStack[mediaStack.length - 1];
        const id = normalizeIdentifier(media.labelId);
        resume();

        if (!hasOwnProperty.call(definitions, id)) {
          definitions[id] = mediaStack[mediaStack.length - 1];
        }

        mediaStack.pop();
      }
      /** @type {Handle} */

      function onentercontent() {
        setData('slurpAllLineEndings', true);
      }
      /** @type {Handle} */

      function onexitatxheadingsequence(token) {
        // Exit for further sequences.
        if (getData('headingRank')) return
        setData('headingRank', this.sliceSerialize(token).length);
        lineEndingIfNeeded();
        tag('<h' + getData('headingRank') + '>');
      }
      /** @type {Handle} */

      function onentersetextheading() {
        buffer();
        setData('slurpAllLineEndings');
      }
      /** @type {Handle} */

      function onexitsetextheadingtext() {
        setData('slurpAllLineEndings', true);
      }
      /** @type {Handle} */

      function onexitatxheading() {
        tag('</h' + getData('headingRank') + '>');
        setData('headingRank');
      }
      /** @type {Handle} */

      function onexitsetextheadinglinesequence(token) {
        setData(
          'headingRank',
          this.sliceSerialize(token).charCodeAt(0) === 61 ? 1 : 2
        );
      }
      /** @type {Handle} */

      function onexitsetextheading() {
        const value = resume();
        lineEndingIfNeeded();
        tag('<h' + getData('headingRank') + '>');
        raw(value);
        tag('</h' + getData('headingRank') + '>');
        setData('slurpAllLineEndings');
        setData('headingRank');
      }
      /** @type {Handle} */

      function onexitdata(token) {
        raw(encode$1(this.sliceSerialize(token)));
      }
      /** @type {Handle} */

      function onexitlineending(token) {
        if (getData('slurpAllLineEndings')) {
          return
        }

        if (getData('slurpOneLineEnding')) {
          setData('slurpOneLineEnding');
          return
        }

        if (getData('inCodeText')) {
          raw(' ');
          return
        }

        raw(encode$1(this.sliceSerialize(token)));
      }
      /** @type {Handle} */

      function onexitcodeflowvalue(token) {
        raw(encode$1(this.sliceSerialize(token)));
        setData('flowCodeSeenData', true);
      }
      /** @type {Handle} */

      function onexithardbreak() {
        tag('<br />');
      }
      /** @type {Handle} */

      function onenterhtmlflow() {
        lineEndingIfNeeded();
        onenterhtml();
      }
      /** @type {Handle} */

      function onexithtml() {
        setData('ignoreEncode');
      }
      /** @type {Handle} */

      function onenterhtml() {
        if (options.allowDangerousHtml) {
          setData('ignoreEncode', true);
        }
      }
      /** @type {Handle} */

      function onenteremphasis() {
        tag('<em>');
      }
      /** @type {Handle} */

      function onenterstrong() {
        tag('<strong>');
      }
      /** @type {Handle} */

      function onentercodetext() {
        setData('inCodeText', true);
        tag('<code>');
      }
      /** @type {Handle} */

      function onexitcodetext() {
        setData('inCodeText');
        tag('</code>');
      }
      /** @type {Handle} */

      function onexitemphasis() {
        tag('</em>');
      }
      /** @type {Handle} */

      function onexitstrong() {
        tag('</strong>');
      }
      /** @type {Handle} */

      function onexitthematicbreak() {
        lineEndingIfNeeded();
        tag('<hr />');
      }
      /** @type {Handle} */

      function onexitcharacterreferencemarker(token) {
        setData('characterReferenceType', token.type);
      }
      /** @type {Handle} */

      function onexitcharacterreferencevalue(token) {
        let value = this.sliceSerialize(token); // @ts-expect-error `decodeEntity` can return false for invalid named
        // character references, but everything we’ve tokenized is valid.

        value = getData('characterReferenceType')
          ? decodeNumericCharacterReference(
              value,
              getData('characterReferenceType') ===
                'characterReferenceMarkerNumeric'
                ? 10
                : 16
            )
          : decodeEntity(value);
        raw(encode$1(value));
        setData('characterReferenceType');
      }
      /** @type {Handle} */

      function onexitautolinkprotocol(token) {
        const uri = this.sliceSerialize(token);
        tag(
          '<a href="' +
            sanitizeUri(
              uri,
              options.allowDangerousProtocol ? undefined : protocolHref
            ) +
            '">'
        );
        raw(encode$1(uri));
        tag('</a>');
      }
      /** @type {Handle} */

      function onexitautolinkemail(token) {
        const uri = this.sliceSerialize(token);
        tag('<a href="' + sanitizeUri('mailto:' + uri) + '">');
        raw(encode$1(uri));
        tag('</a>');
      }
    }

    /**
     * @typedef {import('micromark-util-types').Effects} Effects
     * @typedef {import('micromark-util-types').State} State
     */
    /**
     * @param {Effects} effects
     * @param {State} ok
     * @param {string} type
     * @param {number} [max=Infinity]
     * @returns {State}
     */

    function factorySpace(effects, ok, type, max) {
      const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
      let size = 0;
      return start
      /** @type {State} */

      function start(code) {
        if (markdownSpace(code)) {
          effects.enter(type);
          return prefix(code)
        }

        return ok(code)
      }
      /** @type {State} */

      function prefix(code) {
        if (markdownSpace(code) && size++ < limit) {
          effects.consume(code);
          return prefix
        }

        effects.exit(type);
        return ok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').InitialConstruct} InitialConstruct
     * @typedef {import('micromark-util-types').Initializer} Initializer
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {InitialConstruct} */
    const content$1 = {
      tokenize: initializeContent
    };
    /** @type {Initializer} */

    function initializeContent(effects) {
      const contentStart = effects.attempt(
        this.parser.constructs.contentInitial,
        afterContentStartConstruct,
        paragraphInitial
      );
      /** @type {Token} */

      let previous;
      return contentStart
      /** @type {State} */

      function afterContentStartConstruct(code) {
        if (code === null) {
          effects.consume(code);
          return
        }

        effects.enter('lineEnding');
        effects.consume(code);
        effects.exit('lineEnding');
        return factorySpace(effects, contentStart, 'linePrefix')
      }
      /** @type {State} */

      function paragraphInitial(code) {
        effects.enter('paragraph');
        return lineStart(code)
      }
      /** @type {State} */

      function lineStart(code) {
        const token = effects.enter('chunkText', {
          contentType: 'text',
          previous
        });

        if (previous) {
          previous.next = token;
        }

        previous = token;
        return data(code)
      }
      /** @type {State} */

      function data(code) {
        if (code === null) {
          effects.exit('chunkText');
          effects.exit('paragraph');
          effects.consume(code);
          return
        }

        if (markdownLineEnding(code)) {
          effects.consume(code);
          effects.exit('chunkText');
          return lineStart
        } // Data.

        effects.consume(code);
        return data
      }
    }

    /**
     * @typedef {import('micromark-util-types').InitialConstruct} InitialConstruct
     * @typedef {import('micromark-util-types').Initializer} Initializer
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Point} Point
     */
    /** @type {InitialConstruct} */

    const document$2 = {
      tokenize: initializeDocument
    };
    /** @type {Construct} */

    const containerConstruct = {
      tokenize: tokenizeContainer
    };
    /** @type {Initializer} */

    function initializeDocument(effects) {
      const self = this;
      /** @type {StackItem[]} */

      const stack = [];
      let continued = 0;
      /** @type {TokenizeContext|undefined} */

      let childFlow;
      /** @type {Token|undefined} */

      let childToken;
      /** @type {number} */

      let lineStartOffset;
      return start
      /** @type {State} */

      function start(code) {
        // First we iterate through the open blocks, starting with the root
        // document, and descending through last children down to the last open
        // block.
        // Each block imposes a condition that the line must satisfy if the block is
        // to remain open.
        // For example, a block quote requires a `>` character.
        // A paragraph requires a non-blank line.
        // In this phase we may match all or just some of the open blocks.
        // But we cannot close unmatched blocks yet, because we may have a lazy
        // continuation line.
        if (continued < stack.length) {
          const item = stack[continued];
          self.containerState = item[1];
          return effects.attempt(
            item[0].continuation,
            documentContinue,
            checkNewContainers
          )(code)
        } // Done.

        return checkNewContainers(code)
      }
      /** @type {State} */

      function documentContinue(code) {
        continued++; // Note: this field is called `_closeFlow` but it also closes containers.
        // Perhaps a good idea to rename it but it’s already used in the wild by
        // extensions.

        if (self.containerState._closeFlow) {
          self.containerState._closeFlow = undefined;

          if (childFlow) {
            closeFlow();
          } // Note: this algorithm for moving events around is similar to the
          // algorithm when dealing with lazy lines in `writeToChild`.

          const indexBeforeExits = self.events.length;
          let indexBeforeFlow = indexBeforeExits;
          /** @type {Point|undefined} */

          let point; // Find the flow chunk.

          while (indexBeforeFlow--) {
            if (
              self.events[indexBeforeFlow][0] === 'exit' &&
              self.events[indexBeforeFlow][1].type === 'chunkFlow'
            ) {
              point = self.events[indexBeforeFlow][1].end;
              break
            }
          }

          exitContainers(continued); // Fix positions.

          let index = indexBeforeExits;

          while (index < self.events.length) {
            self.events[index][1].end = Object.assign({}, point);
            index++;
          } // Inject the exits earlier (they’re still also at the end).

          splice(
            self.events,
            indexBeforeFlow + 1,
            0,
            self.events.slice(indexBeforeExits)
          ); // Discard the duplicate exits.

          self.events.length = index;
          return checkNewContainers(code)
        }

        return start(code)
      }
      /** @type {State} */

      function checkNewContainers(code) {
        // Next, after consuming the continuation markers for existing blocks, we
        // look for new block starts (e.g. `>` for a block quote).
        // If we encounter a new block start, we close any blocks unmatched in
        // step 1 before creating the new block as a child of the last matched
        // block.
        if (continued === stack.length) {
          // No need to `check` whether there’s a container, of `exitContainers`
          // would be moot.
          // We can instead immediately `attempt` to parse one.
          if (!childFlow) {
            return documentContinued(code)
          } // If we have concrete content, such as block HTML or fenced code,
          // we can’t have containers “pierce” into them, so we can immediately
          // start.

          if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) {
            return flowStart(code)
          } // If we do have flow, it could still be a blank line,
          // but we’d be interrupting it w/ a new container if there’s a current
          // construct.

          self.interrupt = Boolean(
            childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack
          );
        } // Check if there is a new container.

        self.containerState = {};
        return effects.check(
          containerConstruct,
          thereIsANewContainer,
          thereIsNoNewContainer
        )(code)
      }
      /** @type {State} */

      function thereIsANewContainer(code) {
        if (childFlow) closeFlow();
        exitContainers(continued);
        return documentContinued(code)
      }
      /** @type {State} */

      function thereIsNoNewContainer(code) {
        self.parser.lazy[self.now().line] = continued !== stack.length;
        lineStartOffset = self.now().offset;
        return flowStart(code)
      }
      /** @type {State} */

      function documentContinued(code) {
        // Try new containers.
        self.containerState = {};
        return effects.attempt(
          containerConstruct,
          containerContinue,
          flowStart
        )(code)
      }
      /** @type {State} */

      function containerContinue(code) {
        continued++;
        stack.push([self.currentConstruct, self.containerState]); // Try another.

        return documentContinued(code)
      }
      /** @type {State} */

      function flowStart(code) {
        if (code === null) {
          if (childFlow) closeFlow();
          exitContainers(0);
          effects.consume(code);
          return
        }

        childFlow = childFlow || self.parser.flow(self.now());
        effects.enter('chunkFlow', {
          contentType: 'flow',
          previous: childToken,
          _tokenizer: childFlow
        });
        return flowContinue(code)
      }
      /** @type {State} */

      function flowContinue(code) {
        if (code === null) {
          writeToChild(effects.exit('chunkFlow'), true);
          exitContainers(0);
          effects.consume(code);
          return
        }

        if (markdownLineEnding(code)) {
          effects.consume(code);
          writeToChild(effects.exit('chunkFlow')); // Get ready for the next line.

          continued = 0;
          self.interrupt = undefined;
          return start
        }

        effects.consume(code);
        return flowContinue
      }
      /**
       * @param {Token} token
       * @param {boolean} [eof]
       * @returns {void}
       */

      function writeToChild(token, eof) {
        const stream = self.sliceStream(token);
        if (eof) stream.push(null);
        token.previous = childToken;
        if (childToken) childToken.next = token;
        childToken = token;
        childFlow.defineSkip(token.start);
        childFlow.write(stream); // Alright, so we just added a lazy line:
        //
        // ```markdown
        // > a
        // b.
        //
        // Or:
        //
        // > ~~~c
        // d
        //
        // Or:
        //
        // > | e |
        // f
        // ```
        //
        // The construct in the second example (fenced code) does not accept lazy
        // lines, so it marked itself as done at the end of its first line, and
        // then the content construct parses `d`.
        // Most constructs in markdown match on the first line: if the first line
        // forms a construct, a non-lazy line can’t “unmake” it.
        //
        // The construct in the third example is potentially a GFM table, and
        // those are *weird*.
        // It *could* be a table, from the first line, if the following line
        // matches a condition.
        // In this case, that second line is lazy, which “unmakes” the first line
        // and turns the whole into one content block.
        //
        // We’ve now parsed the non-lazy and the lazy line, and can figure out
        // whether the lazy line started a new flow block.
        // If it did, we exit the current containers between the two flow blocks.

        if (self.parser.lazy[token.start.line]) {
          let index = childFlow.events.length;

          while (index--) {
            if (
              // The token starts before the line ending…
              childFlow.events[index][1].start.offset < lineStartOffset && // …and either is not ended yet…
              (!childFlow.events[index][1].end || // …or ends after it.
                childFlow.events[index][1].end.offset > lineStartOffset)
            ) {
              // Exit: there’s still something open, which means it’s a lazy line
              // part of something.
              return
            }
          } // Note: this algorithm for moving events around is similar to the
          // algorithm when closing flow in `documentContinue`.

          const indexBeforeExits = self.events.length;
          let indexBeforeFlow = indexBeforeExits;
          /** @type {boolean|undefined} */

          let seen;
          /** @type {Point|undefined} */

          let point; // Find the previous chunk (the one before the lazy line).

          while (indexBeforeFlow--) {
            if (
              self.events[indexBeforeFlow][0] === 'exit' &&
              self.events[indexBeforeFlow][1].type === 'chunkFlow'
            ) {
              if (seen) {
                point = self.events[indexBeforeFlow][1].end;
                break
              }

              seen = true;
            }
          }

          exitContainers(continued); // Fix positions.

          index = indexBeforeExits;

          while (index < self.events.length) {
            self.events[index][1].end = Object.assign({}, point);
            index++;
          } // Inject the exits earlier (they’re still also at the end).

          splice(
            self.events,
            indexBeforeFlow + 1,
            0,
            self.events.slice(indexBeforeExits)
          ); // Discard the duplicate exits.

          self.events.length = index;
        }
      }
      /**
       * @param {number} size
       * @returns {void}
       */

      function exitContainers(size) {
        let index = stack.length; // Exit open containers.

        while (index-- > size) {
          const entry = stack[index];
          self.containerState = entry[1];
          entry[0].exit.call(self, effects);
        }

        stack.length = size;
      }

      function closeFlow() {
        childFlow.write([null]);
        childToken = undefined;
        childFlow = undefined;
        self.containerState._closeFlow = undefined;
      }
    }
    /** @type {Tokenizer} */

    function tokenizeContainer(effects, ok, nok) {
      return factorySpace(
        effects,
        effects.attempt(this.parser.constructs.document, ok, nok),
        'linePrefix',
        this.parser.constructs.disable.null.includes('codeIndented') ? undefined : 4
      )
    }

    /**
     * @typedef {import('micromark-util-types').Code} Code
     */

    /**
     * Classify whether a character code represents whitespace, punctuation, or
     * something else.
     *
     * Used for attention (emphasis, strong), whose sequences can open or close
     * based on the class of surrounding characters.
     *
     * Note that eof (`null`) is seen as whitespace.
     *
     * @param {Code} code
     * @returns {number|undefined}
     */
    function classifyCharacter(code) {
      if (
        code === null ||
        markdownLineEndingOrSpace(code) ||
        unicodeWhitespace(code)
      ) {
        return 1
      }

      if (unicodePunctuation(code)) {
        return 2
      }
    }

    /**
     * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
     * @typedef {import('micromark-util-types').Event} Event
     * @typedef {import('micromark-util-types').Resolver} Resolver
     */

    /**
     * Call all `resolveAll`s.
     *
     * @param {{resolveAll?: Resolver}[]} constructs
     * @param {Event[]} events
     * @param {TokenizeContext} context
     * @returns {Event[]}
     */
    function resolveAll(constructs, events, context) {
      /** @type {Resolver[]} */
      const called = [];
      let index = -1;

      while (++index < constructs.length) {
        const resolve = constructs[index].resolveAll;

        if (resolve && !called.includes(resolve)) {
          events = resolve(events, context);
          called.push(resolve);
        }
      }

      return events
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').Event} Event
     * @typedef {import('micromark-util-types').Code} Code
     * @typedef {import('micromark-util-types').Point} Point
     */

    /** @type {Construct} */
    const attention = {
      name: 'attention',
      tokenize: tokenizeAttention,
      resolveAll: resolveAllAttention
    };
    /**
     * Take all events and resolve attention to emphasis or strong.
     *
     * @type {Resolver}
     */

    function resolveAllAttention(events, context) {
      let index = -1;
      /** @type {number} */

      let open;
      /** @type {Token} */

      let group;
      /** @type {Token} */

      let text;
      /** @type {Token} */

      let openingSequence;
      /** @type {Token} */

      let closingSequence;
      /** @type {number} */

      let use;
      /** @type {Event[]} */

      let nextEvents;
      /** @type {number} */

      let offset; // Walk through all events.
      //
      // Note: performance of this is fine on an mb of normal markdown, but it’s
      // a bottleneck for malicious stuff.

      while (++index < events.length) {
        // Find a token that can close.
        if (
          events[index][0] === 'enter' &&
          events[index][1].type === 'attentionSequence' &&
          events[index][1]._close
        ) {
          open = index; // Now walk back to find an opener.

          while (open--) {
            // Find a token that can open the closer.
            if (
              events[open][0] === 'exit' &&
              events[open][1].type === 'attentionSequence' &&
              events[open][1]._open && // If the markers are the same:
              context.sliceSerialize(events[open][1]).charCodeAt(0) ===
                context.sliceSerialize(events[index][1]).charCodeAt(0)
            ) {
              // If the opening can close or the closing can open,
              // and the close size *is not* a multiple of three,
              // but the sum of the opening and closing size *is* multiple of three,
              // then don’t match.
              if (
                (events[open][1]._close || events[index][1]._open) &&
                (events[index][1].end.offset - events[index][1].start.offset) % 3 &&
                !(
                  (events[open][1].end.offset -
                    events[open][1].start.offset +
                    events[index][1].end.offset -
                    events[index][1].start.offset) %
                  3
                )
              ) {
                continue
              } // Number of markers to use from the sequence.

              use =
                events[open][1].end.offset - events[open][1].start.offset > 1 &&
                events[index][1].end.offset - events[index][1].start.offset > 1
                  ? 2
                  : 1;
              const start = Object.assign({}, events[open][1].end);
              const end = Object.assign({}, events[index][1].start);
              movePoint(start, -use);
              movePoint(end, use);
              openingSequence = {
                type: use > 1 ? 'strongSequence' : 'emphasisSequence',
                start,
                end: Object.assign({}, events[open][1].end)
              };
              closingSequence = {
                type: use > 1 ? 'strongSequence' : 'emphasisSequence',
                start: Object.assign({}, events[index][1].start),
                end
              };
              text = {
                type: use > 1 ? 'strongText' : 'emphasisText',
                start: Object.assign({}, events[open][1].end),
                end: Object.assign({}, events[index][1].start)
              };
              group = {
                type: use > 1 ? 'strong' : 'emphasis',
                start: Object.assign({}, openingSequence.start),
                end: Object.assign({}, closingSequence.end)
              };
              events[open][1].end = Object.assign({}, openingSequence.start);
              events[index][1].start = Object.assign({}, closingSequence.end);
              nextEvents = []; // If there are more markers in the opening, add them before.

              if (events[open][1].end.offset - events[open][1].start.offset) {
                nextEvents = push(nextEvents, [
                  ['enter', events[open][1], context],
                  ['exit', events[open][1], context]
                ]);
              } // Opening.

              nextEvents = push(nextEvents, [
                ['enter', group, context],
                ['enter', openingSequence, context],
                ['exit', openingSequence, context],
                ['enter', text, context]
              ]); // Between.

              nextEvents = push(
                nextEvents,
                resolveAll(
                  context.parser.constructs.insideSpan.null,
                  events.slice(open + 1, index),
                  context
                )
              ); // Closing.

              nextEvents = push(nextEvents, [
                ['exit', text, context],
                ['enter', closingSequence, context],
                ['exit', closingSequence, context],
                ['exit', group, context]
              ]); // If there are more markers in the closing, add them after.

              if (events[index][1].end.offset - events[index][1].start.offset) {
                offset = 2;
                nextEvents = push(nextEvents, [
                  ['enter', events[index][1], context],
                  ['exit', events[index][1], context]
                ]);
              } else {
                offset = 0;
              }

              splice(events, open - 1, index - open + 3, nextEvents);
              index = open + nextEvents.length - offset - 2;
              break
            }
          }
        }
      } // Remove remaining sequences.

      index = -1;

      while (++index < events.length) {
        if (events[index][1].type === 'attentionSequence') {
          events[index][1].type = 'data';
        }
      }

      return events
    }
    /** @type {Tokenizer} */

    function tokenizeAttention(effects, ok) {
      const attentionMarkers = this.parser.constructs.attentionMarkers.null;
      const previous = this.previous;
      const before = classifyCharacter(previous);
      /** @type {NonNullable<Code>} */

      let marker;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('attentionSequence');
        marker = code;
        return sequence(code)
      }
      /** @type {State} */

      function sequence(code) {
        if (code === marker) {
          effects.consume(code);
          return sequence
        }

        const token = effects.exit('attentionSequence');
        const after = classifyCharacter(code);
        const open =
          !after || (after === 2 && before) || attentionMarkers.includes(code);
        const close =
          !before || (before === 2 && after) || attentionMarkers.includes(previous);
        token._open = Boolean(marker === 42 ? open : open && (before || !close));
        token._close = Boolean(marker === 42 ? close : close && (after || !open));
        return ok(code)
      }
    }
    /**
     * Move a point a bit.
     *
     * Note: `move` only works inside lines! It’s not possible to move past other
     * chunks (replacement characters, tabs, or line endings).
     *
     * @param {Point} point
     * @param {number} offset
     * @returns {void}
     */

    function movePoint(point, offset) {
      point.column += offset;
      point.offset += offset;
      point._bufferIndex += offset;
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const autolink = {
      name: 'autolink',
      tokenize: tokenizeAutolink
    };
    /** @type {Tokenizer} */

    function tokenizeAutolink(effects, ok, nok) {
      let size = 1;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('autolink');
        effects.enter('autolinkMarker');
        effects.consume(code);
        effects.exit('autolinkMarker');
        effects.enter('autolinkProtocol');
        return open
      }
      /** @type {State} */

      function open(code) {
        if (asciiAlpha(code)) {
          effects.consume(code);
          return schemeOrEmailAtext
        }

        return asciiAtext(code) ? emailAtext(code) : nok(code)
      }
      /** @type {State} */

      function schemeOrEmailAtext(code) {
        return code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)
          ? schemeInsideOrEmailAtext(code)
          : emailAtext(code)
      }
      /** @type {State} */

      function schemeInsideOrEmailAtext(code) {
        if (code === 58) {
          effects.consume(code);
          return urlInside
        }

        if (
          (code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) &&
          size++ < 32
        ) {
          effects.consume(code);
          return schemeInsideOrEmailAtext
        }

        return emailAtext(code)
      }
      /** @type {State} */

      function urlInside(code) {
        if (code === 62) {
          effects.exit('autolinkProtocol');
          return end(code)
        }

        if (code === null || code === 32 || code === 60 || asciiControl(code)) {
          return nok(code)
        }

        effects.consume(code);
        return urlInside
      }
      /** @type {State} */

      function emailAtext(code) {
        if (code === 64) {
          effects.consume(code);
          size = 0;
          return emailAtSignOrDot
        }

        if (asciiAtext(code)) {
          effects.consume(code);
          return emailAtext
        }

        return nok(code)
      }
      /** @type {State} */

      function emailAtSignOrDot(code) {
        return asciiAlphanumeric(code) ? emailLabel(code) : nok(code)
      }
      /** @type {State} */

      function emailLabel(code) {
        if (code === 46) {
          effects.consume(code);
          size = 0;
          return emailAtSignOrDot
        }

        if (code === 62) {
          // Exit, then change the type.
          effects.exit('autolinkProtocol').type = 'autolinkEmail';
          return end(code)
        }

        return emailValue(code)
      }
      /** @type {State} */

      function emailValue(code) {
        if ((code === 45 || asciiAlphanumeric(code)) && size++ < 63) {
          effects.consume(code);
          return code === 45 ? emailValue : emailLabel
        }

        return nok(code)
      }
      /** @type {State} */

      function end(code) {
        effects.enter('autolinkMarker');
        effects.consume(code);
        effects.exit('autolinkMarker');
        effects.exit('autolink');
        return ok
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const blankLine = {
      tokenize: tokenizeBlankLine,
      partial: true
    };
    /** @type {Tokenizer} */

    function tokenizeBlankLine(effects, ok, nok) {
      return factorySpace(effects, afterWhitespace, 'linePrefix')
      /** @type {State} */

      function afterWhitespace(code) {
        return code === null || markdownLineEnding(code) ? ok(code) : nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Exiter} Exiter
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const blockQuote = {
      name: 'blockQuote',
      tokenize: tokenizeBlockQuoteStart,
      continuation: {
        tokenize: tokenizeBlockQuoteContinuation
      },
      exit
    };
    /** @type {Tokenizer} */

    function tokenizeBlockQuoteStart(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        if (code === 62) {
          const state = self.containerState;

          if (!state.open) {
            effects.enter('blockQuote', {
              _container: true
            });
            state.open = true;
          }

          effects.enter('blockQuotePrefix');
          effects.enter('blockQuoteMarker');
          effects.consume(code);
          effects.exit('blockQuoteMarker');
          return after
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        if (markdownSpace(code)) {
          effects.enter('blockQuotePrefixWhitespace');
          effects.consume(code);
          effects.exit('blockQuotePrefixWhitespace');
          effects.exit('blockQuotePrefix');
          return ok
        }

        effects.exit('blockQuotePrefix');
        return ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeBlockQuoteContinuation(effects, ok, nok) {
      return factorySpace(
        effects,
        effects.attempt(blockQuote, ok, nok),
        'linePrefix',
        this.parser.constructs.disable.null.includes('codeIndented') ? undefined : 4
      )
    }
    /** @type {Exiter} */

    function exit(effects) {
      effects.exit('blockQuote');
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const characterEscape = {
      name: 'characterEscape',
      tokenize: tokenizeCharacterEscape
    };
    /** @type {Tokenizer} */

    function tokenizeCharacterEscape(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('characterEscape');
        effects.enter('escapeMarker');
        effects.consume(code);
        effects.exit('escapeMarker');
        return open
      }
      /** @type {State} */

      function open(code) {
        if (asciiPunctuation(code)) {
          effects.enter('characterEscapeValue');
          effects.consume(code);
          effects.exit('characterEscapeValue');
          effects.exit('characterEscape');
          return ok
        }

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /** @type {Construct} */
    const characterReference = {
      name: 'characterReference',
      tokenize: tokenizeCharacterReference
    };
    /** @type {Tokenizer} */

    function tokenizeCharacterReference(effects, ok, nok) {
      const self = this;
      let size = 0;
      /** @type {number} */

      let max;
      /** @type {(code: Code) => code is number} */

      let test;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('characterReference');
        effects.enter('characterReferenceMarker');
        effects.consume(code);
        effects.exit('characterReferenceMarker');
        return open
      }
      /** @type {State} */

      function open(code) {
        if (code === 35) {
          effects.enter('characterReferenceMarkerNumeric');
          effects.consume(code);
          effects.exit('characterReferenceMarkerNumeric');
          return numeric
        }

        effects.enter('characterReferenceValue');
        max = 31;
        test = asciiAlphanumeric;
        return value(code)
      }
      /** @type {State} */

      function numeric(code) {
        if (code === 88 || code === 120) {
          effects.enter('characterReferenceMarkerHexadecimal');
          effects.consume(code);
          effects.exit('characterReferenceMarkerHexadecimal');
          effects.enter('characterReferenceValue');
          max = 6;
          test = asciiHexDigit;
          return value
        }

        effects.enter('characterReferenceValue');
        max = 7;
        test = asciiDigit;
        return value(code)
      }
      /** @type {State} */

      function value(code) {
        /** @type {Token} */
        let token;

        if (code === 59 && size) {
          token = effects.exit('characterReferenceValue');

          if (
            test === asciiAlphanumeric &&
            !decodeEntity(self.sliceSerialize(token))
          ) {
            return nok(code)
          }

          effects.enter('characterReferenceMarker');
          effects.consume(code);
          effects.exit('characterReferenceMarker');
          effects.exit('characterReference');
          return ok
        }

        if (test(code) && size++ < max) {
          effects.consume(code);
          return value
        }

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /** @type {Construct} */
    const codeFenced = {
      name: 'codeFenced',
      tokenize: tokenizeCodeFenced,
      concrete: true
    };
    /** @type {Tokenizer} */

    function tokenizeCodeFenced(effects, ok, nok) {
      const self = this;
      /** @type {Construct} */

      const closingFenceConstruct = {
        tokenize: tokenizeClosingFence,
        partial: true
      };
      /** @type {Construct} */

      const nonLazyLine = {
        tokenize: tokenizeNonLazyLine,
        partial: true
      };
      const tail = this.events[this.events.length - 1];
      const initialPrefix =
        tail && tail[1].type === 'linePrefix'
          ? tail[2].sliceSerialize(tail[1], true).length
          : 0;
      let sizeOpen = 0;
      /** @type {NonNullable<Code>} */

      let marker;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('codeFenced');
        effects.enter('codeFencedFence');
        effects.enter('codeFencedFenceSequence');
        marker = code;
        return sequenceOpen(code)
      }
      /** @type {State} */

      function sequenceOpen(code) {
        if (code === marker) {
          effects.consume(code);
          sizeOpen++;
          return sequenceOpen
        }

        effects.exit('codeFencedFenceSequence');
        return sizeOpen < 3
          ? nok(code)
          : factorySpace(effects, infoOpen, 'whitespace')(code)
      }
      /** @type {State} */

      function infoOpen(code) {
        if (code === null || markdownLineEnding(code)) {
          return openAfter(code)
        }

        effects.enter('codeFencedFenceInfo');
        effects.enter('chunkString', {
          contentType: 'string'
        });
        return info(code)
      }
      /** @type {State} */

      function info(code) {
        if (code === null || markdownLineEndingOrSpace(code)) {
          effects.exit('chunkString');
          effects.exit('codeFencedFenceInfo');
          return factorySpace(effects, infoAfter, 'whitespace')(code)
        }

        if (code === 96 && code === marker) return nok(code)
        effects.consume(code);
        return info
      }
      /** @type {State} */

      function infoAfter(code) {
        if (code === null || markdownLineEnding(code)) {
          return openAfter(code)
        }

        effects.enter('codeFencedFenceMeta');
        effects.enter('chunkString', {
          contentType: 'string'
        });
        return meta(code)
      }
      /** @type {State} */

      function meta(code) {
        if (code === null || markdownLineEnding(code)) {
          effects.exit('chunkString');
          effects.exit('codeFencedFenceMeta');
          return openAfter(code)
        }

        if (code === 96 && code === marker) return nok(code)
        effects.consume(code);
        return meta
      }
      /** @type {State} */

      function openAfter(code) {
        effects.exit('codeFencedFence');
        return self.interrupt ? ok(code) : contentStart(code)
      }
      /** @type {State} */

      function contentStart(code) {
        if (code === null) {
          return after(code)
        }

        if (markdownLineEnding(code)) {
          return effects.attempt(
            nonLazyLine,
            effects.attempt(
              closingFenceConstruct,
              after,
              initialPrefix
                ? factorySpace(
                    effects,
                    contentStart,
                    'linePrefix',
                    initialPrefix + 1
                  )
                : contentStart
            ),
            after
          )(code)
        }

        effects.enter('codeFlowValue');
        return contentContinue(code)
      }
      /** @type {State} */

      function contentContinue(code) {
        if (code === null || markdownLineEnding(code)) {
          effects.exit('codeFlowValue');
          return contentStart(code)
        }

        effects.consume(code);
        return contentContinue
      }
      /** @type {State} */

      function after(code) {
        effects.exit('codeFenced');
        return ok(code)
      }
      /** @type {Tokenizer} */

      function tokenizeNonLazyLine(effects, ok, nok) {
        const self = this;
        return start
        /** @type {State} */

        function start(code) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return lineStart
        }
        /** @type {State} */

        function lineStart(code) {
          return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
        }
      }
      /** @type {Tokenizer} */

      function tokenizeClosingFence(effects, ok, nok) {
        let size = 0;
        return factorySpace(
          effects,
          closingSequenceStart,
          'linePrefix',
          this.parser.constructs.disable.null.includes('codeIndented')
            ? undefined
            : 4
        )
        /** @type {State} */

        function closingSequenceStart(code) {
          effects.enter('codeFencedFence');
          effects.enter('codeFencedFenceSequence');
          return closingSequence(code)
        }
        /** @type {State} */

        function closingSequence(code) {
          if (code === marker) {
            effects.consume(code);
            size++;
            return closingSequence
          }

          if (size < sizeOpen) return nok(code)
          effects.exit('codeFencedFenceSequence');
          return factorySpace(effects, closingSequenceEnd, 'whitespace')(code)
        }
        /** @type {State} */

        function closingSequenceEnd(code) {
          if (code === null || markdownLineEnding(code)) {
            effects.exit('codeFencedFence');
            return ok(code)
          }

          return nok(code)
        }
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const codeIndented = {
      name: 'codeIndented',
      tokenize: tokenizeCodeIndented
    };
    /** @type {Construct} */

    const indentedContent = {
      tokenize: tokenizeIndentedContent,
      partial: true
    };
    /** @type {Tokenizer} */

    function tokenizeCodeIndented(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('codeIndented');
        return factorySpace(effects, afterStartPrefix, 'linePrefix', 4 + 1)(code)
      }
      /** @type {State} */

      function afterStartPrefix(code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
          tail[1].type === 'linePrefix' &&
          tail[2].sliceSerialize(tail[1], true).length >= 4
          ? afterPrefix(code)
          : nok(code)
      }
      /** @type {State} */

      function afterPrefix(code) {
        if (code === null) {
          return after(code)
        }

        if (markdownLineEnding(code)) {
          return effects.attempt(indentedContent, afterPrefix, after)(code)
        }

        effects.enter('codeFlowValue');
        return content(code)
      }
      /** @type {State} */

      function content(code) {
        if (code === null || markdownLineEnding(code)) {
          effects.exit('codeFlowValue');
          return afterPrefix(code)
        }

        effects.consume(code);
        return content
      }
      /** @type {State} */

      function after(code) {
        effects.exit('codeIndented');
        return ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeIndentedContent(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        // If this is a lazy line, it can’t be code.
        if (self.parser.lazy[self.now().line]) {
          return nok(code)
        }

        if (markdownLineEnding(code)) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return start
        }

        return factorySpace(effects, afterPrefix, 'linePrefix', 4 + 1)(code)
      }
      /** @type {State} */

      function afterPrefix(code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
          tail[1].type === 'linePrefix' &&
          tail[2].sliceSerialize(tail[1], true).length >= 4
          ? ok(code)
          : markdownLineEnding(code)
          ? start(code)
          : nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Previous} Previous
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const codeText = {
      name: 'codeText',
      tokenize: tokenizeCodeText,
      resolve: resolveCodeText,
      previous
    };
    /** @type {Resolver} */

    function resolveCodeText(events) {
      let tailExitIndex = events.length - 4;
      let headEnterIndex = 3;
      /** @type {number} */

      let index;
      /** @type {number|undefined} */

      let enter; // If we start and end with an EOL or a space.

      if (
        (events[headEnterIndex][1].type === 'lineEnding' ||
          events[headEnterIndex][1].type === 'space') &&
        (events[tailExitIndex][1].type === 'lineEnding' ||
          events[tailExitIndex][1].type === 'space')
      ) {
        index = headEnterIndex; // And we have data.

        while (++index < tailExitIndex) {
          if (events[index][1].type === 'codeTextData') {
            // Then we have padding.
            events[headEnterIndex][1].type = 'codeTextPadding';
            events[tailExitIndex][1].type = 'codeTextPadding';
            headEnterIndex += 2;
            tailExitIndex -= 2;
            break
          }
        }
      } // Merge adjacent spaces and data.

      index = headEnterIndex - 1;
      tailExitIndex++;

      while (++index <= tailExitIndex) {
        if (enter === undefined) {
          if (index !== tailExitIndex && events[index][1].type !== 'lineEnding') {
            enter = index;
          }
        } else if (
          index === tailExitIndex ||
          events[index][1].type === 'lineEnding'
        ) {
          events[enter][1].type = 'codeTextData';

          if (index !== enter + 2) {
            events[enter][1].end = events[index - 1][1].end;
            events.splice(enter + 2, index - enter - 2);
            tailExitIndex -= index - enter - 2;
            index = enter + 2;
          }

          enter = undefined;
        }
      }

      return events
    }
    /** @type {Previous} */

    function previous(code) {
      // If there is a previous code, there will always be a tail.
      return (
        code !== 96 ||
        this.events[this.events.length - 1][1].type === 'characterEscape'
      )
    }
    /** @type {Tokenizer} */

    function tokenizeCodeText(effects, ok, nok) {
      let sizeOpen = 0;
      /** @type {number} */

      let size;
      /** @type {Token} */

      let token;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('codeText');
        effects.enter('codeTextSequence');
        return openingSequence(code)
      }
      /** @type {State} */

      function openingSequence(code) {
        if (code === 96) {
          effects.consume(code);
          sizeOpen++;
          return openingSequence
        }

        effects.exit('codeTextSequence');
        return gap(code)
      }
      /** @type {State} */

      function gap(code) {
        // EOF.
        if (code === null) {
          return nok(code)
        } // Closing fence?
        // Could also be data.

        if (code === 96) {
          token = effects.enter('codeTextSequence');
          size = 0;
          return closingSequence(code)
        } // Tabs don’t work, and virtual spaces don’t make sense.

        if (code === 32) {
          effects.enter('space');
          effects.consume(code);
          effects.exit('space');
          return gap
        }

        if (markdownLineEnding(code)) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return gap
        } // Data.

        effects.enter('codeTextData');
        return data(code)
      } // In code.

      /** @type {State} */

      function data(code) {
        if (
          code === null ||
          code === 32 ||
          code === 96 ||
          markdownLineEnding(code)
        ) {
          effects.exit('codeTextData');
          return gap(code)
        }

        effects.consume(code);
        return data
      } // Closing fence.

      /** @type {State} */

      function closingSequence(code) {
        // More.
        if (code === 96) {
          effects.consume(code);
          size++;
          return closingSequence
        } // Done!

        if (size === sizeOpen) {
          effects.exit('codeTextSequence');
          effects.exit('codeText');
          return ok(code)
        } // More or less accents: mark as data.

        token.type = 'codeTextData';
        return data(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').Chunk} Chunk
     * @typedef {import('micromark-util-types').Event} Event
     */

    /**
     * Tokenize subcontent.
     *
     * @param {Event[]} events
     * @returns {boolean}
     */
    function subtokenize(events) {
      /** @type {Record<string, number>} */
      const jumps = {};
      let index = -1;
      /** @type {Event} */

      let event;
      /** @type {number|undefined} */

      let lineIndex;
      /** @type {number} */

      let otherIndex;
      /** @type {Event} */

      let otherEvent;
      /** @type {Event[]} */

      let parameters;
      /** @type {Event[]} */

      let subevents;
      /** @type {boolean|undefined} */

      let more;

      while (++index < events.length) {
        while (index in jumps) {
          index = jumps[index];
        }

        event = events[index]; // Add a hook for the GFM tasklist extension, which needs to know if text
        // is in the first content of a list item.

        if (
          index &&
          event[1].type === 'chunkFlow' &&
          events[index - 1][1].type === 'listItemPrefix'
        ) {
          subevents = event[1]._tokenizer.events;
          otherIndex = 0;

          if (
            otherIndex < subevents.length &&
            subevents[otherIndex][1].type === 'lineEndingBlank'
          ) {
            otherIndex += 2;
          }

          if (
            otherIndex < subevents.length &&
            subevents[otherIndex][1].type === 'content'
          ) {
            while (++otherIndex < subevents.length) {
              if (subevents[otherIndex][1].type === 'content') {
                break
              }

              if (subevents[otherIndex][1].type === 'chunkText') {
                subevents[otherIndex][1]._isInFirstContentOfListItem = true;
                otherIndex++;
              }
            }
          }
        } // Enter.

        if (event[0] === 'enter') {
          if (event[1].contentType) {
            Object.assign(jumps, subcontent(events, index));
            index = jumps[index];
            more = true;
          }
        } // Exit.
        else if (event[1]._container) {
          otherIndex = index;
          lineIndex = undefined;

          while (otherIndex--) {
            otherEvent = events[otherIndex];

            if (
              otherEvent[1].type === 'lineEnding' ||
              otherEvent[1].type === 'lineEndingBlank'
            ) {
              if (otherEvent[0] === 'enter') {
                if (lineIndex) {
                  events[lineIndex][1].type = 'lineEndingBlank';
                }

                otherEvent[1].type = 'lineEnding';
                lineIndex = otherIndex;
              }
            } else {
              break
            }
          }

          if (lineIndex) {
            // Fix position.
            event[1].end = Object.assign({}, events[lineIndex][1].start); // Switch container exit w/ line endings.

            parameters = events.slice(lineIndex, index);
            parameters.unshift(event);
            splice(events, lineIndex, index - lineIndex + 1, parameters);
          }
        }
      }

      return !more
    }
    /**
     * Tokenize embedded tokens.
     *
     * @param {Event[]} events
     * @param {number} eventIndex
     * @returns {Record<string, number>}
     */

    function subcontent(events, eventIndex) {
      const token = events[eventIndex][1];
      const context = events[eventIndex][2];
      let startPosition = eventIndex - 1;
      /** @type {number[]} */

      const startPositions = [];
      const tokenizer =
        token._tokenizer || context.parser[token.contentType](token.start);
      const childEvents = tokenizer.events;
      /** @type {[number, number][]} */

      const jumps = [];
      /** @type {Record<string, number>} */

      const gaps = {};
      /** @type {Chunk[]} */

      let stream;
      /** @type {Token|undefined} */

      let previous;
      let index = -1;
      /** @type {Token|undefined} */

      let current = token;
      let adjust = 0;
      let start = 0;
      const breaks = [start]; // Loop forward through the linked tokens to pass them in order to the
      // subtokenizer.

      while (current) {
        // Find the position of the event for this token.
        while (events[++startPosition][1] !== current) {
          // Empty.
        }

        startPositions.push(startPosition);

        if (!current._tokenizer) {
          stream = context.sliceStream(current);

          if (!current.next) {
            stream.push(null);
          }

          if (previous) {
            tokenizer.defineSkip(current.start);
          }

          if (current._isInFirstContentOfListItem) {
            tokenizer._gfmTasklistFirstContentOfListItem = true;
          }

          tokenizer.write(stream);

          if (current._isInFirstContentOfListItem) {
            tokenizer._gfmTasklistFirstContentOfListItem = undefined;
          }
        } // Unravel the next token.

        previous = current;
        current = current.next;
      } // Now, loop back through all events (and linked tokens), to figure out which
      // parts belong where.

      current = token;

      while (++index < childEvents.length) {
        if (
          // Find a void token that includes a break.
          childEvents[index][0] === 'exit' &&
          childEvents[index - 1][0] === 'enter' &&
          childEvents[index][1].type === childEvents[index - 1][1].type &&
          childEvents[index][1].start.line !== childEvents[index][1].end.line
        ) {
          start = index + 1;
          breaks.push(start); // Help GC.

          current._tokenizer = undefined;
          current.previous = undefined;
          current = current.next;
        }
      } // Help GC.

      tokenizer.events = []; // If there’s one more token (which is the cases for lines that end in an
      // EOF), that’s perfect: the last point we found starts it.
      // If there isn’t then make sure any remaining content is added to it.

      if (current) {
        // Help GC.
        current._tokenizer = undefined;
        current.previous = undefined;
      } else {
        breaks.pop();
      } // Now splice the events from the subtokenizer into the current events,
      // moving back to front so that splice indices aren’t affected.

      index = breaks.length;

      while (index--) {
        const slice = childEvents.slice(breaks[index], breaks[index + 1]);
        const start = startPositions.pop();
        jumps.unshift([start, start + slice.length - 1]);
        splice(events, start, 2, slice);
      }

      index = -1;

      while (++index < jumps.length) {
        gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
        adjust += jumps[index][1] - jumps[index][0] - 1;
      }

      return gaps
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     */

    /**
     * No name because it must not be turned off.
     * @type {Construct}
     */
    const content = {
      tokenize: tokenizeContent,
      resolve: resolveContent
    };
    /** @type {Construct} */

    const continuationConstruct = {
      tokenize: tokenizeContinuation,
      partial: true
    };
    /**
     * Content is transparent: it’s parsed right now. That way, definitions are also
     * parsed right now: before text in paragraphs (specifically, media) are parsed.
     *
     * @type {Resolver}
     */

    function resolveContent(events) {
      subtokenize(events);
      return events
    }
    /** @type {Tokenizer} */

    function tokenizeContent(effects, ok) {
      /** @type {Token} */
      let previous;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('content');
        previous = effects.enter('chunkContent', {
          contentType: 'content'
        });
        return data(code)
      }
      /** @type {State} */

      function data(code) {
        if (code === null) {
          return contentEnd(code)
        }

        if (markdownLineEnding(code)) {
          return effects.check(
            continuationConstruct,
            contentContinue,
            contentEnd
          )(code)
        } // Data.

        effects.consume(code);
        return data
      }
      /** @type {State} */

      function contentEnd(code) {
        effects.exit('chunkContent');
        effects.exit('content');
        return ok(code)
      }
      /** @type {State} */

      function contentContinue(code) {
        effects.consume(code);
        effects.exit('chunkContent');
        previous.next = effects.enter('chunkContent', {
          contentType: 'content',
          previous
        });
        previous = previous.next;
        return data
      }
    }
    /** @type {Tokenizer} */

    function tokenizeContinuation(effects, ok, nok) {
      const self = this;
      return startLookahead
      /** @type {State} */

      function startLookahead(code) {
        effects.exit('chunkContent');
        effects.enter('lineEnding');
        effects.consume(code);
        effects.exit('lineEnding');
        return factorySpace(effects, prefixed, 'linePrefix')
      }
      /** @type {State} */

      function prefixed(code) {
        if (code === null || markdownLineEnding(code)) {
          return nok(code)
        }

        const tail = self.events[self.events.length - 1];

        if (
          !self.parser.constructs.disable.null.includes('codeIndented') &&
          tail &&
          tail[1].type === 'linePrefix' &&
          tail[2].sliceSerialize(tail[1], true).length >= 4
        ) {
          return ok(code)
        }

        return effects.interrupt(self.parser.constructs.flow, nok, ok)(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Effects} Effects
     * @typedef {import('micromark-util-types').State} State
     */

    /**
     * @param {Effects} effects
     * @param {State} ok
     * @param {State} nok
     * @param {string} type
     * @param {string} literalType
     * @param {string} literalMarkerType
     * @param {string} rawType
     * @param {string} stringType
     * @param {number} [max=Infinity]
     * @returns {State}
     */
    // eslint-disable-next-line max-params
    function factoryDestination(
      effects,
      ok,
      nok,
      type,
      literalType,
      literalMarkerType,
      rawType,
      stringType,
      max
    ) {
      const limit = max || Number.POSITIVE_INFINITY;
      let balance = 0;
      return start
      /** @type {State} */

      function start(code) {
        if (code === 60) {
          effects.enter(type);
          effects.enter(literalType);
          effects.enter(literalMarkerType);
          effects.consume(code);
          effects.exit(literalMarkerType);
          return destinationEnclosedBefore
        }

        if (code === null || code === 41 || asciiControl(code)) {
          return nok(code)
        }

        effects.enter(type);
        effects.enter(rawType);
        effects.enter(stringType);
        effects.enter('chunkString', {
          contentType: 'string'
        });
        return destinationRaw(code)
      }
      /** @type {State} */

      function destinationEnclosedBefore(code) {
        if (code === 62) {
          effects.enter(literalMarkerType);
          effects.consume(code);
          effects.exit(literalMarkerType);
          effects.exit(literalType);
          effects.exit(type);
          return ok
        }

        effects.enter(stringType);
        effects.enter('chunkString', {
          contentType: 'string'
        });
        return destinationEnclosed(code)
      }
      /** @type {State} */

      function destinationEnclosed(code) {
        if (code === 62) {
          effects.exit('chunkString');
          effects.exit(stringType);
          return destinationEnclosedBefore(code)
        }

        if (code === null || code === 60 || markdownLineEnding(code)) {
          return nok(code)
        }

        effects.consume(code);
        return code === 92 ? destinationEnclosedEscape : destinationEnclosed
      }
      /** @type {State} */

      function destinationEnclosedEscape(code) {
        if (code === 60 || code === 62 || code === 92) {
          effects.consume(code);
          return destinationEnclosed
        }

        return destinationEnclosed(code)
      }
      /** @type {State} */

      function destinationRaw(code) {
        if (code === 40) {
          if (++balance > limit) return nok(code)
          effects.consume(code);
          return destinationRaw
        }

        if (code === 41) {
          if (!balance--) {
            effects.exit('chunkString');
            effects.exit(stringType);
            effects.exit(rawType);
            effects.exit(type);
            return ok(code)
          }

          effects.consume(code);
          return destinationRaw
        }

        if (code === null || markdownLineEndingOrSpace(code)) {
          if (balance) return nok(code)
          effects.exit('chunkString');
          effects.exit(stringType);
          effects.exit(rawType);
          effects.exit(type);
          return ok(code)
        }

        if (asciiControl(code)) return nok(code)
        effects.consume(code);
        return code === 92 ? destinationRawEscape : destinationRaw
      }
      /** @type {State} */

      function destinationRawEscape(code) {
        if (code === 40 || code === 41 || code === 92) {
          effects.consume(code);
          return destinationRaw
        }

        return destinationRaw(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Effects} Effects
     * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
     * @typedef {import('micromark-util-types').State} State
     */

    /**
     * @this {TokenizeContext}
     * @param {Effects} effects
     * @param {State} ok
     * @param {State} nok
     * @param {string} type
     * @param {string} markerType
     * @param {string} stringType
     * @returns {State}
     */
    // eslint-disable-next-line max-params
    function factoryLabel(effects, ok, nok, type, markerType, stringType) {
      const self = this;
      let size = 0;
      /** @type {boolean} */

      let data;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter(type);
        effects.enter(markerType);
        effects.consume(code);
        effects.exit(markerType);
        effects.enter(stringType);
        return atBreak
      }
      /** @type {State} */

      function atBreak(code) {
        if (
          code === null ||
          code === 91 ||
          (code === 93 && !data) ||
          /* To do: remove in the future once we’ve switched from
           * `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
           * which doesn’t need this */

          /* Hidden footnotes hook */

          /* c8 ignore next 3 */
          (code === 94 &&
            !size &&
            '_hiddenFootnoteSupport' in self.parser.constructs) ||
          size > 999
        ) {
          return nok(code)
        }

        if (code === 93) {
          effects.exit(stringType);
          effects.enter(markerType);
          effects.consume(code);
          effects.exit(markerType);
          effects.exit(type);
          return ok
        }

        if (markdownLineEnding(code)) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return atBreak
        }

        effects.enter('chunkString', {
          contentType: 'string'
        });
        return label(code)
      }
      /** @type {State} */

      function label(code) {
        if (
          code === null ||
          code === 91 ||
          code === 93 ||
          markdownLineEnding(code) ||
          size++ > 999
        ) {
          effects.exit('chunkString');
          return atBreak(code)
        }

        effects.consume(code);
        data = data || !markdownSpace(code);
        return code === 92 ? labelEscape : label
      }
      /** @type {State} */

      function labelEscape(code) {
        if (code === 91 || code === 92 || code === 93) {
          effects.consume(code);
          size++;
          return label
        }

        return label(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Effects} Effects
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /**
     * @param {Effects} effects
     * @param {State} ok
     * @param {State} nok
     * @param {string} type
     * @param {string} markerType
     * @param {string} stringType
     * @returns {State}
     */
    // eslint-disable-next-line max-params
    function factoryTitle(effects, ok, nok, type, markerType, stringType) {
      /** @type {NonNullable<Code>} */
      let marker;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter(type);
        effects.enter(markerType);
        effects.consume(code);
        effects.exit(markerType);
        marker = code === 40 ? 41 : code;
        return atFirstTitleBreak
      }
      /** @type {State} */

      function atFirstTitleBreak(code) {
        if (code === marker) {
          effects.enter(markerType);
          effects.consume(code);
          effects.exit(markerType);
          effects.exit(type);
          return ok
        }

        effects.enter(stringType);
        return atTitleBreak(code)
      }
      /** @type {State} */

      function atTitleBreak(code) {
        if (code === marker) {
          effects.exit(stringType);
          return atFirstTitleBreak(marker)
        }

        if (code === null) {
          return nok(code)
        } // Note: blank lines can’t exist in content.

        if (markdownLineEnding(code)) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return factorySpace(effects, atTitleBreak, 'linePrefix')
        }

        effects.enter('chunkString', {
          contentType: 'string'
        });
        return title(code)
      }
      /** @type {State} */

      function title(code) {
        if (code === marker || code === null || markdownLineEnding(code)) {
          effects.exit('chunkString');
          return atTitleBreak(code)
        }

        effects.consume(code);
        return code === 92 ? titleEscape : title
      }
      /** @type {State} */

      function titleEscape(code) {
        if (code === marker || code === 92) {
          effects.consume(code);
          return title
        }

        return title(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Effects} Effects
     * @typedef {import('micromark-util-types').State} State
     */

    /**
     * @param {Effects} effects
     * @param {State} ok
     */
    function factoryWhitespace(effects, ok) {
      /** @type {boolean} */
      let seen;
      return start
      /** @type {State} */

      function start(code) {
        if (markdownLineEnding(code)) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          seen = true;
          return start
        }

        if (markdownSpace(code)) {
          return factorySpace(
            effects,
            start,
            seen ? 'linePrefix' : 'lineSuffix'
          )(code)
        }

        return ok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const definition = {
      name: 'definition',
      tokenize: tokenizeDefinition
    };
    /** @type {Construct} */

    const titleConstruct = {
      tokenize: tokenizeTitle,
      partial: true
    };
    /** @type {Tokenizer} */

    function tokenizeDefinition(effects, ok, nok) {
      const self = this;
      /** @type {string} */

      let identifier;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('definition');
        return factoryLabel.call(
          self,
          effects,
          labelAfter,
          nok,
          'definitionLabel',
          'definitionLabelMarker',
          'definitionLabelString'
        )(code)
      }
      /** @type {State} */

      function labelAfter(code) {
        identifier = normalizeIdentifier(
          self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1)
        );

        if (code === 58) {
          effects.enter('definitionMarker');
          effects.consume(code);
          effects.exit('definitionMarker'); // Note: blank lines can’t exist in content.

          return factoryWhitespace(
            effects,
            factoryDestination(
              effects,
              effects.attempt(
                titleConstruct,
                factorySpace(effects, after, 'whitespace'),
                factorySpace(effects, after, 'whitespace')
              ),
              nok,
              'definitionDestination',
              'definitionDestinationLiteral',
              'definitionDestinationLiteralMarker',
              'definitionDestinationRaw',
              'definitionDestinationString'
            )
          )
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        if (code === null || markdownLineEnding(code)) {
          effects.exit('definition');

          if (!self.parser.defined.includes(identifier)) {
            self.parser.defined.push(identifier);
          }

          return ok(code)
        }

        return nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeTitle(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        return markdownLineEndingOrSpace(code)
          ? factoryWhitespace(effects, before)(code)
          : nok(code)
      }
      /** @type {State} */

      function before(code) {
        if (code === 34 || code === 39 || code === 40) {
          return factoryTitle(
            effects,
            factorySpace(effects, after, 'whitespace'),
            nok,
            'definitionTitle',
            'definitionTitleMarker',
            'definitionTitleString'
          )(code)
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        return code === null || markdownLineEnding(code) ? ok(code) : nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const hardBreakEscape = {
      name: 'hardBreakEscape',
      tokenize: tokenizeHardBreakEscape
    };
    /** @type {Tokenizer} */

    function tokenizeHardBreakEscape(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('hardBreakEscape');
        effects.enter('escapeMarker');
        effects.consume(code);
        return open
      }
      /** @type {State} */

      function open(code) {
        if (markdownLineEnding(code)) {
          effects.exit('escapeMarker');
          effects.exit('hardBreakEscape');
          return ok(code)
        }

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const headingAtx = {
      name: 'headingAtx',
      tokenize: tokenizeHeadingAtx,
      resolve: resolveHeadingAtx
    };
    /** @type {Resolver} */

    function resolveHeadingAtx(events, context) {
      let contentEnd = events.length - 2;
      let contentStart = 3;
      /** @type {Token} */

      let content;
      /** @type {Token} */

      let text; // Prefix whitespace, part of the opening.

      if (events[contentStart][1].type === 'whitespace') {
        contentStart += 2;
      } // Suffix whitespace, part of the closing.

      if (
        contentEnd - 2 > contentStart &&
        events[contentEnd][1].type === 'whitespace'
      ) {
        contentEnd -= 2;
      }

      if (
        events[contentEnd][1].type === 'atxHeadingSequence' &&
        (contentStart === contentEnd - 1 ||
          (contentEnd - 4 > contentStart &&
            events[contentEnd - 2][1].type === 'whitespace'))
      ) {
        contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
      }

      if (contentEnd > contentStart) {
        content = {
          type: 'atxHeadingText',
          start: events[contentStart][1].start,
          end: events[contentEnd][1].end
        };
        text = {
          type: 'chunkText',
          start: events[contentStart][1].start,
          end: events[contentEnd][1].end,
          // @ts-expect-error Constants are fine to assign.
          contentType: 'text'
        };
        splice(events, contentStart, contentEnd - contentStart + 1, [
          ['enter', content, context],
          ['enter', text, context],
          ['exit', text, context],
          ['exit', content, context]
        ]);
      }

      return events
    }
    /** @type {Tokenizer} */

    function tokenizeHeadingAtx(effects, ok, nok) {
      const self = this;
      let size = 0;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('atxHeading');
        effects.enter('atxHeadingSequence');
        return fenceOpenInside(code)
      }
      /** @type {State} */

      function fenceOpenInside(code) {
        if (code === 35 && size++ < 6) {
          effects.consume(code);
          return fenceOpenInside
        }

        if (code === null || markdownLineEndingOrSpace(code)) {
          effects.exit('atxHeadingSequence');
          return self.interrupt ? ok(code) : headingBreak(code)
        }

        return nok(code)
      }
      /** @type {State} */

      function headingBreak(code) {
        if (code === 35) {
          effects.enter('atxHeadingSequence');
          return sequence(code)
        }

        if (code === null || markdownLineEnding(code)) {
          effects.exit('atxHeading');
          return ok(code)
        }

        if (markdownSpace(code)) {
          return factorySpace(effects, headingBreak, 'whitespace')(code)
        }

        effects.enter('atxHeadingText');
        return data(code)
      }
      /** @type {State} */

      function sequence(code) {
        if (code === 35) {
          effects.consume(code);
          return sequence
        }

        effects.exit('atxHeadingSequence');
        return headingBreak(code)
      }
      /** @type {State} */

      function data(code) {
        if (code === null || code === 35 || markdownLineEndingOrSpace(code)) {
          effects.exit('atxHeadingText');
          return headingBreak(code)
        }

        effects.consume(code);
        return data
      }
    }

    /**
     * List of lowercase HTML tag names which when parsing HTML (flow), result
     * in more relaxed rules (condition 6): because they are known blocks, the
     * HTML-like syntax doesn’t have to be strictly parsed.
     * For tag names not in this list, a more strict algorithm (condition 7) is used
     * to detect whether the HTML-like syntax is seen as HTML (flow) or not.
     *
     * This is copied from:
     * <https://spec.commonmark.org/0.29/#html-blocks>.
     */
    const htmlBlockNames = [
      'address',
      'article',
      'aside',
      'base',
      'basefont',
      'blockquote',
      'body',
      'caption',
      'center',
      'col',
      'colgroup',
      'dd',
      'details',
      'dialog',
      'dir',
      'div',
      'dl',
      'dt',
      'fieldset',
      'figcaption',
      'figure',
      'footer',
      'form',
      'frame',
      'frameset',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'head',
      'header',
      'hr',
      'html',
      'iframe',
      'legend',
      'li',
      'link',
      'main',
      'menu',
      'menuitem',
      'nav',
      'noframes',
      'ol',
      'optgroup',
      'option',
      'p',
      'param',
      'section',
      'source',
      'summary',
      'table',
      'tbody',
      'td',
      'tfoot',
      'th',
      'thead',
      'title',
      'tr',
      'track',
      'ul'
    ];

    /**
     * List of lowercase HTML tag names which when parsing HTML (flow), result in
     * HTML that can include lines w/o exiting, until a closing tag also in this
     * list is found (condition 1).
     *
     * This module is copied from:
     * <https://spec.commonmark.org/0.29/#html-blocks>.
     *
     * Note that `textarea` is not available in `CommonMark@0.29` but has been
     * merged to the primary branch and is slated to be released in the next release
     * of CommonMark.
     */
    const htmlRawNames = ['pre', 'script', 'style', 'textarea'];

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */
    /** @type {Construct} */

    const htmlFlow = {
      name: 'htmlFlow',
      tokenize: tokenizeHtmlFlow,
      resolveTo: resolveToHtmlFlow,
      concrete: true
    };
    /** @type {Construct} */

    const nextBlankConstruct = {
      tokenize: tokenizeNextBlank,
      partial: true
    };
    /** @type {Resolver} */

    function resolveToHtmlFlow(events) {
      let index = events.length;

      while (index--) {
        if (events[index][0] === 'enter' && events[index][1].type === 'htmlFlow') {
          break
        }
      }

      if (index > 1 && events[index - 2][1].type === 'linePrefix') {
        // Add the prefix start to the HTML token.
        events[index][1].start = events[index - 2][1].start; // Add the prefix start to the HTML line token.

        events[index + 1][1].start = events[index - 2][1].start; // Remove the line prefix.

        events.splice(index - 2, 2);
      }

      return events
    }
    /** @type {Tokenizer} */

    function tokenizeHtmlFlow(effects, ok, nok) {
      const self = this;
      /** @type {number} */

      let kind;
      /** @type {boolean} */

      let startTag;
      /** @type {string} */

      let buffer;
      /** @type {number} */

      let index;
      /** @type {Code} */

      let marker;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('htmlFlow');
        effects.enter('htmlFlowData');
        effects.consume(code);
        return open
      }
      /** @type {State} */

      function open(code) {
        if (code === 33) {
          effects.consume(code);
          return declarationStart
        }

        if (code === 47) {
          effects.consume(code);
          return tagCloseStart
        }

        if (code === 63) {
          effects.consume(code);
          kind = 3; // While we’re in an instruction instead of a declaration, we’re on a `?`
          // right now, so we do need to search for `>`, similar to declarations.

          return self.interrupt ? ok : continuationDeclarationInside
        }

        if (asciiAlpha(code)) {
          effects.consume(code);
          buffer = String.fromCharCode(code);
          startTag = true;
          return tagName
        }

        return nok(code)
      }
      /** @type {State} */

      function declarationStart(code) {
        if (code === 45) {
          effects.consume(code);
          kind = 2;
          return commentOpenInside
        }

        if (code === 91) {
          effects.consume(code);
          kind = 5;
          buffer = 'CDATA[';
          index = 0;
          return cdataOpenInside
        }

        if (asciiAlpha(code)) {
          effects.consume(code);
          kind = 4;
          return self.interrupt ? ok : continuationDeclarationInside
        }

        return nok(code)
      }
      /** @type {State} */

      function commentOpenInside(code) {
        if (code === 45) {
          effects.consume(code);
          return self.interrupt ? ok : continuationDeclarationInside
        }

        return nok(code)
      }
      /** @type {State} */

      function cdataOpenInside(code) {
        if (code === buffer.charCodeAt(index++)) {
          effects.consume(code);
          return index === buffer.length
            ? self.interrupt
              ? ok
              : continuation
            : cdataOpenInside
        }

        return nok(code)
      }
      /** @type {State} */

      function tagCloseStart(code) {
        if (asciiAlpha(code)) {
          effects.consume(code);
          buffer = String.fromCharCode(code);
          return tagName
        }

        return nok(code)
      }
      /** @type {State} */

      function tagName(code) {
        if (
          code === null ||
          code === 47 ||
          code === 62 ||
          markdownLineEndingOrSpace(code)
        ) {
          if (
            code !== 47 &&
            startTag &&
            htmlRawNames.includes(buffer.toLowerCase())
          ) {
            kind = 1;
            return self.interrupt ? ok(code) : continuation(code)
          }

          if (htmlBlockNames.includes(buffer.toLowerCase())) {
            kind = 6;

            if (code === 47) {
              effects.consume(code);
              return basicSelfClosing
            }

            return self.interrupt ? ok(code) : continuation(code)
          }

          kind = 7; // Do not support complete HTML when interrupting

          return self.interrupt && !self.parser.lazy[self.now().line]
            ? nok(code)
            : startTag
            ? completeAttributeNameBefore(code)
            : completeClosingTagAfter(code)
        }

        if (code === 45 || asciiAlphanumeric(code)) {
          effects.consume(code);
          buffer += String.fromCharCode(code);
          return tagName
        }

        return nok(code)
      }
      /** @type {State} */

      function basicSelfClosing(code) {
        if (code === 62) {
          effects.consume(code);
          return self.interrupt ? ok : continuation
        }

        return nok(code)
      }
      /** @type {State} */

      function completeClosingTagAfter(code) {
        if (markdownSpace(code)) {
          effects.consume(code);
          return completeClosingTagAfter
        }

        return completeEnd(code)
      }
      /** @type {State} */

      function completeAttributeNameBefore(code) {
        if (code === 47) {
          effects.consume(code);
          return completeEnd
        }

        if (code === 58 || code === 95 || asciiAlpha(code)) {
          effects.consume(code);
          return completeAttributeName
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return completeAttributeNameBefore
        }

        return completeEnd(code)
      }
      /** @type {State} */

      function completeAttributeName(code) {
        if (
          code === 45 ||
          code === 46 ||
          code === 58 ||
          code === 95 ||
          asciiAlphanumeric(code)
        ) {
          effects.consume(code);
          return completeAttributeName
        }

        return completeAttributeNameAfter(code)
      }
      /** @type {State} */

      function completeAttributeNameAfter(code) {
        if (code === 61) {
          effects.consume(code);
          return completeAttributeValueBefore
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return completeAttributeNameAfter
        }

        return completeAttributeNameBefore(code)
      }
      /** @type {State} */

      function completeAttributeValueBefore(code) {
        if (
          code === null ||
          code === 60 ||
          code === 61 ||
          code === 62 ||
          code === 96
        ) {
          return nok(code)
        }

        if (code === 34 || code === 39) {
          effects.consume(code);
          marker = code;
          return completeAttributeValueQuoted
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return completeAttributeValueBefore
        }

        marker = null;
        return completeAttributeValueUnquoted(code)
      }
      /** @type {State} */

      function completeAttributeValueQuoted(code) {
        if (code === null || markdownLineEnding(code)) {
          return nok(code)
        }

        if (code === marker) {
          effects.consume(code);
          return completeAttributeValueQuotedAfter
        }

        effects.consume(code);
        return completeAttributeValueQuoted
      }
      /** @type {State} */

      function completeAttributeValueUnquoted(code) {
        if (
          code === null ||
          code === 34 ||
          code === 39 ||
          code === 60 ||
          code === 61 ||
          code === 62 ||
          code === 96 ||
          markdownLineEndingOrSpace(code)
        ) {
          return completeAttributeNameAfter(code)
        }

        effects.consume(code);
        return completeAttributeValueUnquoted
      }
      /** @type {State} */

      function completeAttributeValueQuotedAfter(code) {
        if (code === 47 || code === 62 || markdownSpace(code)) {
          return completeAttributeNameBefore(code)
        }

        return nok(code)
      }
      /** @type {State} */

      function completeEnd(code) {
        if (code === 62) {
          effects.consume(code);
          return completeAfter
        }

        return nok(code)
      }
      /** @type {State} */

      function completeAfter(code) {
        if (markdownSpace(code)) {
          effects.consume(code);
          return completeAfter
        }

        return code === null || markdownLineEnding(code)
          ? continuation(code)
          : nok(code)
      }
      /** @type {State} */

      function continuation(code) {
        if (code === 45 && kind === 2) {
          effects.consume(code);
          return continuationCommentInside
        }

        if (code === 60 && kind === 1) {
          effects.consume(code);
          return continuationRawTagOpen
        }

        if (code === 62 && kind === 4) {
          effects.consume(code);
          return continuationClose
        }

        if (code === 63 && kind === 3) {
          effects.consume(code);
          return continuationDeclarationInside
        }

        if (code === 93 && kind === 5) {
          effects.consume(code);
          return continuationCharacterDataInside
        }

        if (markdownLineEnding(code) && (kind === 6 || kind === 7)) {
          return effects.check(
            nextBlankConstruct,
            continuationClose,
            continuationAtLineEnding
          )(code)
        }

        if (code === null || markdownLineEnding(code)) {
          return continuationAtLineEnding(code)
        }

        effects.consume(code);
        return continuation
      }
      /** @type {State} */

      function continuationAtLineEnding(code) {
        effects.exit('htmlFlowData');
        return htmlContinueStart(code)
      }
      /** @type {State} */

      function htmlContinueStart(code) {
        if (code === null) {
          return done(code)
        }

        if (markdownLineEnding(code)) {
          return effects.attempt(
            {
              tokenize: htmlLineEnd,
              partial: true
            },
            htmlContinueStart,
            done
          )(code)
        }

        effects.enter('htmlFlowData');
        return continuation(code)
      }
      /** @type {Tokenizer} */

      function htmlLineEnd(effects, ok, nok) {
        return start
        /** @type {State} */

        function start(code) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return lineStart
        }
        /** @type {State} */

        function lineStart(code) {
          return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
        }
      }
      /** @type {State} */

      function continuationCommentInside(code) {
        if (code === 45) {
          effects.consume(code);
          return continuationDeclarationInside
        }

        return continuation(code)
      }
      /** @type {State} */

      function continuationRawTagOpen(code) {
        if (code === 47) {
          effects.consume(code);
          buffer = '';
          return continuationRawEndTag
        }

        return continuation(code)
      }
      /** @type {State} */

      function continuationRawEndTag(code) {
        if (code === 62 && htmlRawNames.includes(buffer.toLowerCase())) {
          effects.consume(code);
          return continuationClose
        }

        if (asciiAlpha(code) && buffer.length < 8) {
          effects.consume(code);
          buffer += String.fromCharCode(code);
          return continuationRawEndTag
        }

        return continuation(code)
      }
      /** @type {State} */

      function continuationCharacterDataInside(code) {
        if (code === 93) {
          effects.consume(code);
          return continuationDeclarationInside
        }

        return continuation(code)
      }
      /** @type {State} */

      function continuationDeclarationInside(code) {
        if (code === 62) {
          effects.consume(code);
          return continuationClose
        } // More dashes.

        if (code === 45 && kind === 2) {
          effects.consume(code);
          return continuationDeclarationInside
        }

        return continuation(code)
      }
      /** @type {State} */

      function continuationClose(code) {
        if (code === null || markdownLineEnding(code)) {
          effects.exit('htmlFlowData');
          return done(code)
        }

        effects.consume(code);
        return continuationClose
      }
      /** @type {State} */

      function done(code) {
        effects.exit('htmlFlow');
        return ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeNextBlank(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.exit('htmlFlowData');
        effects.enter('lineEndingBlank');
        effects.consume(code);
        effects.exit('lineEndingBlank');
        return effects.attempt(blankLine, ok, nok)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /** @type {Construct} */
    const htmlText = {
      name: 'htmlText',
      tokenize: tokenizeHtmlText
    };
    /** @type {Tokenizer} */

    function tokenizeHtmlText(effects, ok, nok) {
      const self = this;
      /** @type {NonNullable<Code>|undefined} */

      let marker;
      /** @type {string} */

      let buffer;
      /** @type {number} */

      let index;
      /** @type {State} */

      let returnState;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('htmlText');
        effects.enter('htmlTextData');
        effects.consume(code);
        return open
      }
      /** @type {State} */

      function open(code) {
        if (code === 33) {
          effects.consume(code);
          return declarationOpen
        }

        if (code === 47) {
          effects.consume(code);
          return tagCloseStart
        }

        if (code === 63) {
          effects.consume(code);
          return instruction
        }

        if (asciiAlpha(code)) {
          effects.consume(code);
          return tagOpen
        }

        return nok(code)
      }
      /** @type {State} */

      function declarationOpen(code) {
        if (code === 45) {
          effects.consume(code);
          return commentOpen
        }

        if (code === 91) {
          effects.consume(code);
          buffer = 'CDATA[';
          index = 0;
          return cdataOpen
        }

        if (asciiAlpha(code)) {
          effects.consume(code);
          return declaration
        }

        return nok(code)
      }
      /** @type {State} */

      function commentOpen(code) {
        if (code === 45) {
          effects.consume(code);
          return commentStart
        }

        return nok(code)
      }
      /** @type {State} */

      function commentStart(code) {
        if (code === null || code === 62) {
          return nok(code)
        }

        if (code === 45) {
          effects.consume(code);
          return commentStartDash
        }

        return comment(code)
      }
      /** @type {State} */

      function commentStartDash(code) {
        if (code === null || code === 62) {
          return nok(code)
        }

        return comment(code)
      }
      /** @type {State} */

      function comment(code) {
        if (code === null) {
          return nok(code)
        }

        if (code === 45) {
          effects.consume(code);
          return commentClose
        }

        if (markdownLineEnding(code)) {
          returnState = comment;
          return atLineEnding(code)
        }

        effects.consume(code);
        return comment
      }
      /** @type {State} */

      function commentClose(code) {
        if (code === 45) {
          effects.consume(code);
          return end
        }

        return comment(code)
      }
      /** @type {State} */

      function cdataOpen(code) {
        if (code === buffer.charCodeAt(index++)) {
          effects.consume(code);
          return index === buffer.length ? cdata : cdataOpen
        }

        return nok(code)
      }
      /** @type {State} */

      function cdata(code) {
        if (code === null) {
          return nok(code)
        }

        if (code === 93) {
          effects.consume(code);
          return cdataClose
        }

        if (markdownLineEnding(code)) {
          returnState = cdata;
          return atLineEnding(code)
        }

        effects.consume(code);
        return cdata
      }
      /** @type {State} */

      function cdataClose(code) {
        if (code === 93) {
          effects.consume(code);
          return cdataEnd
        }

        return cdata(code)
      }
      /** @type {State} */

      function cdataEnd(code) {
        if (code === 62) {
          return end(code)
        }

        if (code === 93) {
          effects.consume(code);
          return cdataEnd
        }

        return cdata(code)
      }
      /** @type {State} */

      function declaration(code) {
        if (code === null || code === 62) {
          return end(code)
        }

        if (markdownLineEnding(code)) {
          returnState = declaration;
          return atLineEnding(code)
        }

        effects.consume(code);
        return declaration
      }
      /** @type {State} */

      function instruction(code) {
        if (code === null) {
          return nok(code)
        }

        if (code === 63) {
          effects.consume(code);
          return instructionClose
        }

        if (markdownLineEnding(code)) {
          returnState = instruction;
          return atLineEnding(code)
        }

        effects.consume(code);
        return instruction
      }
      /** @type {State} */

      function instructionClose(code) {
        return code === 62 ? end(code) : instruction(code)
      }
      /** @type {State} */

      function tagCloseStart(code) {
        if (asciiAlpha(code)) {
          effects.consume(code);
          return tagClose
        }

        return nok(code)
      }
      /** @type {State} */

      function tagClose(code) {
        if (code === 45 || asciiAlphanumeric(code)) {
          effects.consume(code);
          return tagClose
        }

        return tagCloseBetween(code)
      }
      /** @type {State} */

      function tagCloseBetween(code) {
        if (markdownLineEnding(code)) {
          returnState = tagCloseBetween;
          return atLineEnding(code)
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return tagCloseBetween
        }

        return end(code)
      }
      /** @type {State} */

      function tagOpen(code) {
        if (code === 45 || asciiAlphanumeric(code)) {
          effects.consume(code);
          return tagOpen
        }

        if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
          return tagOpenBetween(code)
        }

        return nok(code)
      }
      /** @type {State} */

      function tagOpenBetween(code) {
        if (code === 47) {
          effects.consume(code);
          return end
        }

        if (code === 58 || code === 95 || asciiAlpha(code)) {
          effects.consume(code);
          return tagOpenAttributeName
        }

        if (markdownLineEnding(code)) {
          returnState = tagOpenBetween;
          return atLineEnding(code)
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return tagOpenBetween
        }

        return end(code)
      }
      /** @type {State} */

      function tagOpenAttributeName(code) {
        if (
          code === 45 ||
          code === 46 ||
          code === 58 ||
          code === 95 ||
          asciiAlphanumeric(code)
        ) {
          effects.consume(code);
          return tagOpenAttributeName
        }

        return tagOpenAttributeNameAfter(code)
      }
      /** @type {State} */

      function tagOpenAttributeNameAfter(code) {
        if (code === 61) {
          effects.consume(code);
          return tagOpenAttributeValueBefore
        }

        if (markdownLineEnding(code)) {
          returnState = tagOpenAttributeNameAfter;
          return atLineEnding(code)
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return tagOpenAttributeNameAfter
        }

        return tagOpenBetween(code)
      }
      /** @type {State} */

      function tagOpenAttributeValueBefore(code) {
        if (
          code === null ||
          code === 60 ||
          code === 61 ||
          code === 62 ||
          code === 96
        ) {
          return nok(code)
        }

        if (code === 34 || code === 39) {
          effects.consume(code);
          marker = code;
          return tagOpenAttributeValueQuoted
        }

        if (markdownLineEnding(code)) {
          returnState = tagOpenAttributeValueBefore;
          return atLineEnding(code)
        }

        if (markdownSpace(code)) {
          effects.consume(code);
          return tagOpenAttributeValueBefore
        }

        effects.consume(code);
        marker = undefined;
        return tagOpenAttributeValueUnquoted
      }
      /** @type {State} */

      function tagOpenAttributeValueQuoted(code) {
        if (code === marker) {
          effects.consume(code);
          return tagOpenAttributeValueQuotedAfter
        }

        if (code === null) {
          return nok(code)
        }

        if (markdownLineEnding(code)) {
          returnState = tagOpenAttributeValueQuoted;
          return atLineEnding(code)
        }

        effects.consume(code);
        return tagOpenAttributeValueQuoted
      }
      /** @type {State} */

      function tagOpenAttributeValueQuotedAfter(code) {
        if (code === 62 || code === 47 || markdownLineEndingOrSpace(code)) {
          return tagOpenBetween(code)
        }

        return nok(code)
      }
      /** @type {State} */

      function tagOpenAttributeValueUnquoted(code) {
        if (
          code === null ||
          code === 34 ||
          code === 39 ||
          code === 60 ||
          code === 61 ||
          code === 96
        ) {
          return nok(code)
        }

        if (code === 62 || markdownLineEndingOrSpace(code)) {
          return tagOpenBetween(code)
        }

        effects.consume(code);
        return tagOpenAttributeValueUnquoted
      } // We can’t have blank lines in content, so no need to worry about empty
      // tokens.

      /** @type {State} */

      function atLineEnding(code) {
        effects.exit('htmlTextData');
        effects.enter('lineEnding');
        effects.consume(code);
        effects.exit('lineEnding');
        return factorySpace(
          effects,
          afterPrefix,
          'linePrefix',
          self.parser.constructs.disable.null.includes('codeIndented')
            ? undefined
            : 4
        )
      }
      /** @type {State} */

      function afterPrefix(code) {
        effects.enter('htmlTextData');
        return returnState(code)
      }
      /** @type {State} */

      function end(code) {
        if (code === 62) {
          effects.consume(code);
          effects.exit('htmlTextData');
          effects.exit('htmlText');
          return ok
        }

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Event} Event
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /** @type {Construct} */
    const labelEnd = {
      name: 'labelEnd',
      tokenize: tokenizeLabelEnd,
      resolveTo: resolveToLabelEnd,
      resolveAll: resolveAllLabelEnd
    };
    /** @type {Construct} */

    const resourceConstruct = {
      tokenize: tokenizeResource
    };
    /** @type {Construct} */

    const fullReferenceConstruct = {
      tokenize: tokenizeFullReference
    };
    /** @type {Construct} */

    const collapsedReferenceConstruct = {
      tokenize: tokenizeCollapsedReference
    };
    /** @type {Resolver} */

    function resolveAllLabelEnd(events) {
      let index = -1;
      /** @type {Token} */

      let token;

      while (++index < events.length) {
        token = events[index][1];

        if (
          token.type === 'labelImage' ||
          token.type === 'labelLink' ||
          token.type === 'labelEnd'
        ) {
          // Remove the marker.
          events.splice(index + 1, token.type === 'labelImage' ? 4 : 2);
          token.type = 'data';
          index++;
        }
      }

      return events
    }
    /** @type {Resolver} */

    function resolveToLabelEnd(events, context) {
      let index = events.length;
      let offset = 0;
      /** @type {Token} */

      let token;
      /** @type {number|undefined} */

      let open;
      /** @type {number|undefined} */

      let close;
      /** @type {Event[]} */

      let media; // Find an opening.

      while (index--) {
        token = events[index][1];

        if (open) {
          // If we see another link, or inactive link label, we’ve been here before.
          if (
            token.type === 'link' ||
            (token.type === 'labelLink' && token._inactive)
          ) {
            break
          } // Mark other link openings as inactive, as we can’t have links in
          // links.

          if (events[index][0] === 'enter' && token.type === 'labelLink') {
            token._inactive = true;
          }
        } else if (close) {
          if (
            events[index][0] === 'enter' &&
            (token.type === 'labelImage' || token.type === 'labelLink') &&
            !token._balanced
          ) {
            open = index;

            if (token.type !== 'labelLink') {
              offset = 2;
              break
            }
          }
        } else if (token.type === 'labelEnd') {
          close = index;
        }
      }

      const group = {
        type: events[open][1].type === 'labelLink' ? 'link' : 'image',
        start: Object.assign({}, events[open][1].start),
        end: Object.assign({}, events[events.length - 1][1].end)
      };
      const label = {
        type: 'label',
        start: Object.assign({}, events[open][1].start),
        end: Object.assign({}, events[close][1].end)
      };
      const text = {
        type: 'labelText',
        start: Object.assign({}, events[open + offset + 2][1].end),
        end: Object.assign({}, events[close - 2][1].start)
      };
      media = [
        ['enter', group, context],
        ['enter', label, context]
      ]; // Opening marker.

      media = push(media, events.slice(open + 1, open + offset + 3)); // Text open.

      media = push(media, [['enter', text, context]]); // Between.

      media = push(
        media,
        resolveAll(
          context.parser.constructs.insideSpan.null,
          events.slice(open + offset + 4, close - 3),
          context
        )
      ); // Text close, marker close, label close.

      media = push(media, [
        ['exit', text, context],
        events[close - 2],
        events[close - 1],
        ['exit', label, context]
      ]); // Reference, resource, or so.

      media = push(media, events.slice(close + 1)); // Media close.

      media = push(media, [['exit', group, context]]);
      splice(events, open, events.length, media);
      return events
    }
    /** @type {Tokenizer} */

    function tokenizeLabelEnd(effects, ok, nok) {
      const self = this;
      let index = self.events.length;
      /** @type {Token} */

      let labelStart;
      /** @type {boolean} */

      let defined; // Find an opening.

      while (index--) {
        if (
          (self.events[index][1].type === 'labelImage' ||
            self.events[index][1].type === 'labelLink') &&
          !self.events[index][1]._balanced
        ) {
          labelStart = self.events[index][1];
          break
        }
      }

      return start
      /** @type {State} */

      function start(code) {
        if (!labelStart) {
          return nok(code)
        } // It’s a balanced bracket, but contains a link.

        if (labelStart._inactive) return balanced(code)
        defined = self.parser.defined.includes(
          normalizeIdentifier(
            self.sliceSerialize({
              start: labelStart.end,
              end: self.now()
            })
          )
        );
        effects.enter('labelEnd');
        effects.enter('labelMarker');
        effects.consume(code);
        effects.exit('labelMarker');
        effects.exit('labelEnd');
        return afterLabelEnd
      }
      /** @type {State} */

      function afterLabelEnd(code) {
        // Resource: `[asd](fgh)`.
        if (code === 40) {
          return effects.attempt(
            resourceConstruct,
            ok,
            defined ? ok : balanced
          )(code)
        } // Collapsed (`[asd][]`) or full (`[asd][fgh]`) reference?

        if (code === 91) {
          return effects.attempt(
            fullReferenceConstruct,
            ok,
            defined
              ? effects.attempt(collapsedReferenceConstruct, ok, balanced)
              : balanced
          )(code)
        } // Shortcut reference: `[asd]`?

        return defined ? ok(code) : balanced(code)
      }
      /** @type {State} */

      function balanced(code) {
        labelStart._balanced = true;
        return nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeResource(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('resource');
        effects.enter('resourceMarker');
        effects.consume(code);
        effects.exit('resourceMarker');
        return factoryWhitespace(effects, open)
      }
      /** @type {State} */

      function open(code) {
        if (code === 41) {
          return end(code)
        }

        return factoryDestination(
          effects,
          destinationAfter,
          nok,
          'resourceDestination',
          'resourceDestinationLiteral',
          'resourceDestinationLiteralMarker',
          'resourceDestinationRaw',
          'resourceDestinationString',
          3
        )(code)
      }
      /** @type {State} */

      function destinationAfter(code) {
        return markdownLineEndingOrSpace(code)
          ? factoryWhitespace(effects, between)(code)
          : end(code)
      }
      /** @type {State} */

      function between(code) {
        if (code === 34 || code === 39 || code === 40) {
          return factoryTitle(
            effects,
            factoryWhitespace(effects, end),
            nok,
            'resourceTitle',
            'resourceTitleMarker',
            'resourceTitleString'
          )(code)
        }

        return end(code)
      }
      /** @type {State} */

      function end(code) {
        if (code === 41) {
          effects.enter('resourceMarker');
          effects.consume(code);
          effects.exit('resourceMarker');
          effects.exit('resource');
          return ok
        }

        return nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeFullReference(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        return factoryLabel.call(
          self,
          effects,
          afterLabel,
          nok,
          'reference',
          'referenceMarker',
          'referenceString'
        )(code)
      }
      /** @type {State} */

      function afterLabel(code) {
        return self.parser.defined.includes(
          normalizeIdentifier(
            self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1)
          )
        )
          ? ok(code)
          : nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeCollapsedReference(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('reference');
        effects.enter('referenceMarker');
        effects.consume(code);
        effects.exit('referenceMarker');
        return open
      }
      /** @type {State} */

      function open(code) {
        if (code === 93) {
          effects.enter('referenceMarker');
          effects.consume(code);
          effects.exit('referenceMarker');
          effects.exit('reference');
          return ok
        }

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */
    /** @type {Construct} */

    const labelStartImage = {
      name: 'labelStartImage',
      tokenize: tokenizeLabelStartImage,
      resolveAll: labelEnd.resolveAll
    };
    /** @type {Tokenizer} */

    function tokenizeLabelStartImage(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('labelImage');
        effects.enter('labelImageMarker');
        effects.consume(code);
        effects.exit('labelImageMarker');
        return open
      }
      /** @type {State} */

      function open(code) {
        if (code === 91) {
          effects.enter('labelMarker');
          effects.consume(code);
          effects.exit('labelMarker');
          effects.exit('labelImage');
          return after
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        /* To do: remove in the future once we’ve switched from
         * `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
         * which doesn’t need this */

        /* Hidden footnotes hook */

        /* c8 ignore next 3 */
        return code === 94 && '_hiddenFootnoteSupport' in self.parser.constructs
          ? nok(code)
          : ok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */
    /** @type {Construct} */

    const labelStartLink = {
      name: 'labelStartLink',
      tokenize: tokenizeLabelStartLink,
      resolveAll: labelEnd.resolveAll
    };
    /** @type {Tokenizer} */

    function tokenizeLabelStartLink(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('labelLink');
        effects.enter('labelMarker');
        effects.consume(code);
        effects.exit('labelMarker');
        effects.exit('labelLink');
        return after
      }
      /** @type {State} */

      function after(code) {
        /* To do: remove in the future once we’ve switched from
         * `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
         * which doesn’t need this */

        /* Hidden footnotes hook. */

        /* c8 ignore next 3 */
        return code === 94 && '_hiddenFootnoteSupport' in self.parser.constructs
          ? nok(code)
          : ok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {Construct} */
    const lineEnding = {
      name: 'lineEnding',
      tokenize: tokenizeLineEnding
    };
    /** @type {Tokenizer} */

    function tokenizeLineEnding(effects, ok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('lineEnding');
        effects.consume(code);
        effects.exit('lineEnding');
        return factorySpace(effects, ok, 'linePrefix')
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /** @type {Construct} */
    const thematicBreak = {
      name: 'thematicBreak',
      tokenize: tokenizeThematicBreak
    };
    /** @type {Tokenizer} */

    function tokenizeThematicBreak(effects, ok, nok) {
      let size = 0;
      /** @type {NonNullable<Code>} */

      let marker;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('thematicBreak');
        marker = code;
        return atBreak(code)
      }
      /** @type {State} */

      function atBreak(code) {
        if (code === marker) {
          effects.enter('thematicBreakSequence');
          return sequence(code)
        }

        if (markdownSpace(code)) {
          return factorySpace(effects, atBreak, 'whitespace')(code)
        }

        if (size < 3 || (code !== null && !markdownLineEnding(code))) {
          return nok(code)
        }

        effects.exit('thematicBreak');
        return ok(code)
      }
      /** @type {State} */

      function sequence(code) {
        if (code === marker) {
          effects.consume(code);
          size++;
          return sequence
        }

        effects.exit('thematicBreakSequence');
        return atBreak(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
     * @typedef {import('micromark-util-types').Exiter} Exiter
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */
    /** @type {Construct} */

    const list = {
      name: 'list',
      tokenize: tokenizeListStart,
      continuation: {
        tokenize: tokenizeListContinuation
      },
      exit: tokenizeListEnd
    };
    /** @type {Construct} */

    const listItemPrefixWhitespaceConstruct = {
      tokenize: tokenizeListItemPrefixWhitespace,
      partial: true
    };
    /** @type {Construct} */

    const indentConstruct = {
      tokenize: tokenizeIndent$1,
      partial: true
    };
    /**
     * @type {Tokenizer}
     * @this {TokenizeContextWithState}
     */

    function tokenizeListStart(effects, ok, nok) {
      const self = this;
      const tail = self.events[self.events.length - 1];
      let initialSize =
        tail && tail[1].type === 'linePrefix'
          ? tail[2].sliceSerialize(tail[1], true).length
          : 0;
      let size = 0;
      return start
      /** @type {State} */

      function start(code) {
        const kind =
          self.containerState.type ||
          (code === 42 || code === 43 || code === 45
            ? 'listUnordered'
            : 'listOrdered');

        if (
          kind === 'listUnordered'
            ? !self.containerState.marker || code === self.containerState.marker
            : asciiDigit(code)
        ) {
          if (!self.containerState.type) {
            self.containerState.type = kind;
            effects.enter(kind, {
              _container: true
            });
          }

          if (kind === 'listUnordered') {
            effects.enter('listItemPrefix');
            return code === 42 || code === 45
              ? effects.check(thematicBreak, nok, atMarker)(code)
              : atMarker(code)
          }

          if (!self.interrupt || code === 49) {
            effects.enter('listItemPrefix');
            effects.enter('listItemValue');
            return inside(code)
          }
        }

        return nok(code)
      }
      /** @type {State} */

      function inside(code) {
        if (asciiDigit(code) && ++size < 10) {
          effects.consume(code);
          return inside
        }

        if (
          (!self.interrupt || size < 2) &&
          (self.containerState.marker
            ? code === self.containerState.marker
            : code === 41 || code === 46)
        ) {
          effects.exit('listItemValue');
          return atMarker(code)
        }

        return nok(code)
      }
      /**
       * @type {State}
       **/

      function atMarker(code) {
        effects.enter('listItemMarker');
        effects.consume(code);
        effects.exit('listItemMarker');
        self.containerState.marker = self.containerState.marker || code;
        return effects.check(
          blankLine, // Can’t be empty when interrupting.
          self.interrupt ? nok : onBlank,
          effects.attempt(
            listItemPrefixWhitespaceConstruct,
            endOfPrefix,
            otherPrefix
          )
        )
      }
      /** @type {State} */

      function onBlank(code) {
        self.containerState.initialBlankLine = true;
        initialSize++;
        return endOfPrefix(code)
      }
      /** @type {State} */

      function otherPrefix(code) {
        if (markdownSpace(code)) {
          effects.enter('listItemPrefixWhitespace');
          effects.consume(code);
          effects.exit('listItemPrefixWhitespace');
          return endOfPrefix
        }

        return nok(code)
      }
      /** @type {State} */

      function endOfPrefix(code) {
        self.containerState.size =
          initialSize +
          self.sliceSerialize(effects.exit('listItemPrefix'), true).length;
        return ok(code)
      }
    }
    /**
     * @type {Tokenizer}
     * @this {TokenizeContextWithState}
     */

    function tokenizeListContinuation(effects, ok, nok) {
      const self = this;
      self.containerState._closeFlow = undefined;
      return effects.check(blankLine, onBlank, notBlank)
      /** @type {State} */

      function onBlank(code) {
        self.containerState.furtherBlankLines =
          self.containerState.furtherBlankLines ||
          self.containerState.initialBlankLine; // We have a blank line.
        // Still, try to consume at most the items size.

        return factorySpace(
          effects,
          ok,
          'listItemIndent',
          self.containerState.size + 1
        )(code)
      }
      /** @type {State} */

      function notBlank(code) {
        if (self.containerState.furtherBlankLines || !markdownSpace(code)) {
          self.containerState.furtherBlankLines = undefined;
          self.containerState.initialBlankLine = undefined;
          return notInCurrentItem(code)
        }

        self.containerState.furtherBlankLines = undefined;
        self.containerState.initialBlankLine = undefined;
        return effects.attempt(indentConstruct, ok, notInCurrentItem)(code)
      }
      /** @type {State} */

      function notInCurrentItem(code) {
        // While we do continue, we signal that the flow should be closed.
        self.containerState._closeFlow = true; // As we’re closing flow, we’re no longer interrupting.

        self.interrupt = undefined;
        return factorySpace(
          effects,
          effects.attempt(list, ok, nok),
          'linePrefix',
          self.parser.constructs.disable.null.includes('codeIndented')
            ? undefined
            : 4
        )(code)
      }
    }
    /**
     * @type {Tokenizer}
     * @this {TokenizeContextWithState}
     */

    function tokenizeIndent$1(effects, ok, nok) {
      const self = this;
      return factorySpace(
        effects,
        afterPrefix,
        'listItemIndent',
        self.containerState.size + 1
      )
      /** @type {State} */

      function afterPrefix(code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
          tail[1].type === 'listItemIndent' &&
          tail[2].sliceSerialize(tail[1], true).length === self.containerState.size
          ? ok(code)
          : nok(code)
      }
    }
    /**
     * @type {Exiter}
     * @this {TokenizeContextWithState}
     */

    function tokenizeListEnd(effects) {
      effects.exit(this.containerState.type);
    }
    /**
     * @type {Tokenizer}
     * @this {TokenizeContextWithState}
     */

    function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
      const self = this;
      return factorySpace(
        effects,
        afterPrefix,
        'listItemPrefixWhitespace',
        self.parser.constructs.disable.null.includes('codeIndented')
          ? undefined
          : 4 + 1
      )
      /** @type {State} */

      function afterPrefix(code) {
        const tail = self.events[self.events.length - 1];
        return !markdownSpace(code) &&
          tail &&
          tail[1].type === 'listItemPrefixWhitespace'
          ? ok(code)
          : nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */

    /** @type {Construct} */
    const setextUnderline = {
      name: 'setextUnderline',
      tokenize: tokenizeSetextUnderline,
      resolveTo: resolveToSetextUnderline
    };
    /** @type {Resolver} */

    function resolveToSetextUnderline(events, context) {
      let index = events.length;
      /** @type {number|undefined} */

      let content;
      /** @type {number|undefined} */

      let text;
      /** @type {number|undefined} */

      let definition; // Find the opening of the content.
      // It’ll always exist: we don’t tokenize if it isn’t there.

      while (index--) {
        if (events[index][0] === 'enter') {
          if (events[index][1].type === 'content') {
            content = index;
            break
          }

          if (events[index][1].type === 'paragraph') {
            text = index;
          }
        } // Exit
        else {
          if (events[index][1].type === 'content') {
            // Remove the content end (if needed we’ll add it later)
            events.splice(index, 1);
          }

          if (!definition && events[index][1].type === 'definition') {
            definition = index;
          }
        }
      }

      const heading = {
        type: 'setextHeading',
        start: Object.assign({}, events[text][1].start),
        end: Object.assign({}, events[events.length - 1][1].end)
      }; // Change the paragraph to setext heading text.

      events[text][1].type = 'setextHeadingText'; // If we have definitions in the content, we’ll keep on having content,
      // but we need move it.

      if (definition) {
        events.splice(text, 0, ['enter', heading, context]);
        events.splice(definition + 1, 0, ['exit', events[content][1], context]);
        events[content][1].end = Object.assign({}, events[definition][1].end);
      } else {
        events[content][1] = heading;
      } // Add the heading exit at the end.

      events.push(['exit', heading, context]);
      return events
    }
    /** @type {Tokenizer} */

    function tokenizeSetextUnderline(effects, ok, nok) {
      const self = this;
      let index = self.events.length;
      /** @type {NonNullable<Code>} */

      let marker;
      /** @type {boolean} */

      let paragraph; // Find an opening.

      while (index--) {
        // Skip enter/exit of line ending, line prefix, and content.
        // We can now either have a definition or a paragraph.
        if (
          self.events[index][1].type !== 'lineEnding' &&
          self.events[index][1].type !== 'linePrefix' &&
          self.events[index][1].type !== 'content'
        ) {
          paragraph = self.events[index][1].type === 'paragraph';
          break
        }
      }

      return start
      /** @type {State} */

      function start(code) {
        if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
          effects.enter('setextHeadingLine');
          effects.enter('setextHeadingLineSequence');
          marker = code;
          return closingSequence(code)
        }

        return nok(code)
      }
      /** @type {State} */

      function closingSequence(code) {
        if (code === marker) {
          effects.consume(code);
          return closingSequence
        }

        effects.exit('setextHeadingLineSequence');
        return factorySpace(effects, closingSequenceEnd, 'lineSuffix')(code)
      }
      /** @type {State} */

      function closingSequenceEnd(code) {
        if (code === null || markdownLineEnding(code)) {
          effects.exit('setextHeadingLine');
          return ok(code)
        }

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').InitialConstruct} InitialConstruct
     * @typedef {import('micromark-util-types').Initializer} Initializer
     * @typedef {import('micromark-util-types').State} State
     */

    /** @type {InitialConstruct} */
    const flow$1 = {
      tokenize: initializeFlow
    };
    /** @type {Initializer} */

    function initializeFlow(effects) {
      const self = this;
      const initial = effects.attempt(
        // Try to parse a blank line.
        blankLine,
        atBlankEnding, // Try to parse initial flow (essentially, only code).
        effects.attempt(
          this.parser.constructs.flowInitial,
          afterConstruct,
          factorySpace(
            effects,
            effects.attempt(
              this.parser.constructs.flow,
              afterConstruct,
              effects.attempt(content, afterConstruct)
            ),
            'linePrefix'
          )
        )
      );
      return initial
      /** @type {State} */

      function atBlankEnding(code) {
        if (code === null) {
          effects.consume(code);
          return
        }

        effects.enter('lineEndingBlank');
        effects.consume(code);
        effects.exit('lineEndingBlank');
        self.currentConstruct = undefined;
        return initial
      }
      /** @type {State} */

      function afterConstruct(code) {
        if (code === null) {
          effects.consume(code);
          return
        }

        effects.enter('lineEnding');
        effects.consume(code);
        effects.exit('lineEnding');
        self.currentConstruct = undefined;
        return initial
      }
    }

    /**
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Initializer} Initializer
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').InitialConstruct} InitialConstruct
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Code} Code
     */
    const resolver = {
      resolveAll: createResolver()
    };
    const string$1 = initializeFactory('string');
    const text$2 = initializeFactory('text');
    /**
     * @param {'string'|'text'} field
     * @returns {InitialConstruct}
     */

    function initializeFactory(field) {
      return {
        tokenize: initializeText,
        resolveAll: createResolver(
          field === 'text' ? resolveAllLineSuffixes : undefined
        )
      }
      /** @type {Initializer} */

      function initializeText(effects) {
        const self = this;
        const constructs = this.parser.constructs[field];
        const text = effects.attempt(constructs, start, notText);
        return start
        /** @type {State} */

        function start(code) {
          return atBreak(code) ? text(code) : notText(code)
        }
        /** @type {State} */

        function notText(code) {
          if (code === null) {
            effects.consume(code);
            return
          }

          effects.enter('data');
          effects.consume(code);
          return data
        }
        /** @type {State} */

        function data(code) {
          if (atBreak(code)) {
            effects.exit('data');
            return text(code)
          } // Data.

          effects.consume(code);
          return data
        }
        /**
         * @param {Code} code
         * @returns {boolean}
         */

        function atBreak(code) {
          if (code === null) {
            return true
          }

          const list = constructs[code];
          let index = -1;

          if (list) {
            while (++index < list.length) {
              const item = list[index];

              if (!item.previous || item.previous.call(self, self.previous)) {
                return true
              }
            }
          }

          return false
        }
      }
    }
    /**
     * @param {Resolver} [extraResolver]
     * @returns {Resolver}
     */

    function createResolver(extraResolver) {
      return resolveAllText
      /** @type {Resolver} */

      function resolveAllText(events, context) {
        let index = -1;
        /** @type {number|undefined} */

        let enter; // A rather boring computation (to merge adjacent `data` events) which
        // improves mm performance by 29%.

        while (++index <= events.length) {
          if (enter === undefined) {
            if (events[index] && events[index][1].type === 'data') {
              enter = index;
              index++;
            }
          } else if (!events[index] || events[index][1].type !== 'data') {
            // Don’t do anything if there is one data token.
            if (index !== enter + 2) {
              events[enter][1].end = events[index - 1][1].end;
              events.splice(enter + 2, index - enter - 2);
              index = enter + 2;
            }

            enter = undefined;
          }
        }

        return extraResolver ? extraResolver(events, context) : events
      }
    }
    /**
     * A rather ugly set of instructions which again looks at chunks in the input
     * stream.
     * The reason to do this here is that it is *much* faster to parse in reverse.
     * And that we can’t hook into `null` to split the line suffix before an EOF.
     * To do: figure out if we can make this into a clean utility, or even in core.
     * As it will be useful for GFMs literal autolink extension (and maybe even
     * tables?)
     *
     * @type {Resolver}
     */

    function resolveAllLineSuffixes(events, context) {
      let eventIndex = -1;

      while (++eventIndex <= events.length) {
        if (
          (eventIndex === events.length ||
            events[eventIndex][1].type === 'lineEnding') &&
          events[eventIndex - 1][1].type === 'data'
        ) {
          const data = events[eventIndex - 1][1];
          const chunks = context.sliceStream(data);
          let index = chunks.length;
          let bufferIndex = -1;
          let size = 0;
          /** @type {boolean|undefined} */

          let tabs;

          while (index--) {
            const chunk = chunks[index];

            if (typeof chunk === 'string') {
              bufferIndex = chunk.length;

              while (chunk.charCodeAt(bufferIndex - 1) === 32) {
                size++;
                bufferIndex--;
              }

              if (bufferIndex) break
              bufferIndex = -1;
            } // Number
            else if (chunk === -2) {
              tabs = true;
              size++;
            } else if (chunk === -1) ; else {
              // Replacement character, exit.
              index++;
              break
            }
          }

          if (size) {
            const token = {
              type:
                eventIndex === events.length || tabs || size < 2
                  ? 'lineSuffix'
                  : 'hardBreakTrailing',
              start: {
                line: data.end.line,
                column: data.end.column - size,
                offset: data.end.offset - size,
                _index: data.start._index + index,
                _bufferIndex: index
                  ? bufferIndex
                  : data.start._bufferIndex + bufferIndex
              },
              end: Object.assign({}, data.end)
            };
            data.end = Object.assign({}, token.start);

            if (data.start.offset === data.end.offset) {
              Object.assign(data, token);
            } else {
              events.splice(
                eventIndex,
                0,
                ['enter', token, context],
                ['exit', token, context]
              );
              eventIndex += 2;
            }
          }

          eventIndex++;
        }
      }

      return events
    }

    /**
     * @typedef {import('micromark-util-types').Code} Code
     * @typedef {import('micromark-util-types').Chunk} Chunk
     * @typedef {import('micromark-util-types').Point} Point
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').Effects} Effects
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Construct} Construct
     * @typedef {import('micromark-util-types').InitialConstruct} InitialConstruct
     * @typedef {import('micromark-util-types').ConstructRecord} ConstructRecord
     * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
     * @typedef {import('micromark-util-types').ParseContext} ParseContext
     */

    /**
     * Create a tokenizer.
     * Tokenizers deal with one type of data (e.g., containers, flow, text).
     * The parser is the object dealing with it all.
     * `initialize` works like other constructs, except that only its `tokenize`
     * function is used, in which case it doesn’t receive an `ok` or `nok`.
     * `from` can be given to set the point before the first character, although
     * when further lines are indented, they must be set with `defineSkip`.
     *
     * @param {ParseContext} parser
     * @param {InitialConstruct} initialize
     * @param {Omit<Point, '_index'|'_bufferIndex'>} [from]
     * @returns {TokenizeContext}
     */
    function createTokenizer(parser, initialize, from) {
      /** @type {Point} */
      let point = Object.assign(
        from
          ? Object.assign({}, from)
          : {
              line: 1,
              column: 1,
              offset: 0
            },
        {
          _index: 0,
          _bufferIndex: -1
        }
      );
      /** @type {Record<string, number>} */

      const columnStart = {};
      /** @type {Construct[]} */

      const resolveAllConstructs = [];
      /** @type {Chunk[]} */

      let chunks = [];
      /** @type {Token[]} */

      let stack = [];
      /**
       * Tools used for tokenizing.
       *
       * @type {Effects}
       */

      const effects = {
        consume,
        enter,
        exit,
        attempt: constructFactory(onsuccessfulconstruct),
        check: constructFactory(onsuccessfulcheck),
        interrupt: constructFactory(onsuccessfulcheck, {
          interrupt: true
        })
      };
      /**
       * State and tools for resolving and serializing.
       *
       * @type {TokenizeContext}
       */

      const context = {
        previous: null,
        code: null,
        containerState: {},
        events: [],
        parser,
        sliceStream,
        sliceSerialize,
        now,
        defineSkip,
        write
      };
      /**
       * The state function.
       *
       * @type {State|void}
       */

      let state = initialize.tokenize.call(context, effects);

      if (initialize.resolveAll) {
        resolveAllConstructs.push(initialize);
      }

      return context
      /** @type {TokenizeContext['write']} */

      function write(slice) {
        chunks = push(chunks, slice);
        main(); // Exit if we’re not done, resolve might change stuff.

        if (chunks[chunks.length - 1] !== null) {
          return []
        }

        addResult(initialize, 0); // Otherwise, resolve, and exit.

        context.events = resolveAll(resolveAllConstructs, context.events, context);
        return context.events
      } //
      // Tools.
      //

      /** @type {TokenizeContext['sliceSerialize']} */

      function sliceSerialize(token, expandTabs) {
        return serializeChunks(sliceStream(token), expandTabs)
      }
      /** @type {TokenizeContext['sliceStream']} */

      function sliceStream(token) {
        return sliceChunks(chunks, token)
      }
      /** @type {TokenizeContext['now']} */

      function now() {
        return Object.assign({}, point)
      }
      /** @type {TokenizeContext['defineSkip']} */

      function defineSkip(value) {
        columnStart[value.line] = value.column;
        accountForPotentialSkip();
      } //
      // State management.
      //

      /**
       * Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
       * `consume`).
       * Here is where we walk through the chunks, which either include strings of
       * several characters, or numerical character codes.
       * The reason to do this in a loop instead of a call is so the stack can
       * drain.
       *
       * @returns {void}
       */

      function main() {
        /** @type {number} */
        let chunkIndex;

        while (point._index < chunks.length) {
          const chunk = chunks[point._index]; // If we’re in a buffer chunk, loop through it.

          if (typeof chunk === 'string') {
            chunkIndex = point._index;

            if (point._bufferIndex < 0) {
              point._bufferIndex = 0;
            }

            while (
              point._index === chunkIndex &&
              point._bufferIndex < chunk.length
            ) {
              go(chunk.charCodeAt(point._bufferIndex));
            }
          } else {
            go(chunk);
          }
        }
      }
      /**
       * Deal with one code.
       *
       * @param {Code} code
       * @returns {void}
       */

      function go(code) {
        state = state(code);
      }
      /** @type {Effects['consume']} */

      function consume(code) {
        if (markdownLineEnding(code)) {
          point.line++;
          point.column = 1;
          point.offset += code === -3 ? 2 : 1;
          accountForPotentialSkip();
        } else if (code !== -1) {
          point.column++;
          point.offset++;
        } // Not in a string chunk.

        if (point._bufferIndex < 0) {
          point._index++;
        } else {
          point._bufferIndex++; // At end of string chunk.
          // @ts-expect-error Points w/ non-negative `_bufferIndex` reference
          // strings.

          if (point._bufferIndex === chunks[point._index].length) {
            point._bufferIndex = -1;
            point._index++;
          }
        } // Expose the previous character.

        context.previous = code; // Mark as consumed.
      }
      /** @type {Effects['enter']} */

      function enter(type, fields) {
        /** @type {Token} */
        // @ts-expect-error Patch instead of assign required fields to help GC.
        const token = fields || {};
        token.type = type;
        token.start = now();
        context.events.push(['enter', token, context]);
        stack.push(token);
        return token
      }
      /** @type {Effects['exit']} */

      function exit(type) {
        const token = stack.pop();
        token.end = now();
        context.events.push(['exit', token, context]);
        return token
      }
      /**
       * Use results.
       *
       * @type {ReturnHandle}
       */

      function onsuccessfulconstruct(construct, info) {
        addResult(construct, info.from);
      }
      /**
       * Discard results.
       *
       * @type {ReturnHandle}
       */

      function onsuccessfulcheck(_, info) {
        info.restore();
      }
      /**
       * Factory to attempt/check/interrupt.
       *
       * @param {ReturnHandle} onreturn
       * @param {Record<string, unknown>} [fields]
       */

      function constructFactory(onreturn, fields) {
        return hook
        /**
         * Handle either an object mapping codes to constructs, a list of
         * constructs, or a single construct.
         *
         * @param {Construct|Construct[]|ConstructRecord} constructs
         * @param {State} returnState
         * @param {State} [bogusState]
         * @returns {State}
         */

        function hook(constructs, returnState, bogusState) {
          /** @type {Construct[]} */
          let listOfConstructs;
          /** @type {number} */

          let constructIndex;
          /** @type {Construct} */

          let currentConstruct;
          /** @type {Info} */

          let info;
          return Array.isArray(constructs)
            ? /* c8 ignore next 1 */
              handleListOfConstructs(constructs)
            : 'tokenize' in constructs // @ts-expect-error Looks like a construct.
            ? handleListOfConstructs([constructs])
            : handleMapOfConstructs(constructs)
          /**
           * Handle a list of construct.
           *
           * @param {ConstructRecord} map
           * @returns {State}
           */

          function handleMapOfConstructs(map) {
            return start
            /** @type {State} */

            function start(code) {
              const def = code !== null && map[code];
              const all = code !== null && map.null;
              const list = [
                // To do: add more extension tests.

                /* c8 ignore next 2 */
                ...(Array.isArray(def) ? def : def ? [def] : []),
                ...(Array.isArray(all) ? all : all ? [all] : [])
              ];
              return handleListOfConstructs(list)(code)
            }
          }
          /**
           * Handle a list of construct.
           *
           * @param {Construct[]} list
           * @returns {State}
           */

          function handleListOfConstructs(list) {
            listOfConstructs = list;
            constructIndex = 0;

            if (list.length === 0) {
              return bogusState
            }

            return handleConstruct(list[constructIndex])
          }
          /**
           * Handle a single construct.
           *
           * @param {Construct} construct
           * @returns {State}
           */

          function handleConstruct(construct) {
            return start
            /** @type {State} */

            function start(code) {
              // To do: not needed to store if there is no bogus state, probably?
              // Currently doesn’t work because `inspect` in document does a check
              // w/o a bogus, which doesn’t make sense. But it does seem to help perf
              // by not storing.
              info = store();
              currentConstruct = construct;

              if (!construct.partial) {
                context.currentConstruct = construct;
              }

              if (
                construct.name &&
                context.parser.constructs.disable.null.includes(construct.name)
              ) {
                return nok()
              }

              return construct.tokenize.call(
                // If we do have fields, create an object w/ `context` as its
                // prototype.
                // This allows a “live binding”, which is needed for `interrupt`.
                fields ? Object.assign(Object.create(context), fields) : context,
                effects,
                ok,
                nok
              )(code)
            }
          }
          /** @type {State} */

          function ok(code) {
            onreturn(currentConstruct, info);
            return returnState
          }
          /** @type {State} */

          function nok(code) {
            info.restore();

            if (++constructIndex < listOfConstructs.length) {
              return handleConstruct(listOfConstructs[constructIndex])
            }

            return bogusState
          }
        }
      }
      /**
       * @param {Construct} construct
       * @param {number} from
       * @returns {void}
       */

      function addResult(construct, from) {
        if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
          resolveAllConstructs.push(construct);
        }

        if (construct.resolve) {
          splice(
            context.events,
            from,
            context.events.length - from,
            construct.resolve(context.events.slice(from), context)
          );
        }

        if (construct.resolveTo) {
          context.events = construct.resolveTo(context.events, context);
        }
      }
      /**
       * Store state.
       *
       * @returns {Info}
       */

      function store() {
        const startPoint = now();
        const startPrevious = context.previous;
        const startCurrentConstruct = context.currentConstruct;
        const startEventsIndex = context.events.length;
        const startStack = Array.from(stack);
        return {
          restore,
          from: startEventsIndex
        }
        /**
         * Restore state.
         *
         * @returns {void}
         */

        function restore() {
          point = startPoint;
          context.previous = startPrevious;
          context.currentConstruct = startCurrentConstruct;
          context.events.length = startEventsIndex;
          stack = startStack;
          accountForPotentialSkip();
        }
      }
      /**
       * Move the current point a bit forward in the line when it’s on a column
       * skip.
       *
       * @returns {void}
       */

      function accountForPotentialSkip() {
        if (point.line in columnStart && point.column < 2) {
          point.column = columnStart[point.line];
          point.offset += columnStart[point.line] - 1;
        }
      }
    }
    /**
     * Get the chunks from a slice of chunks in the range of a token.
     *
     * @param {Chunk[]} chunks
     * @param {Pick<Token, 'start'|'end'>} token
     * @returns {Chunk[]}
     */

    function sliceChunks(chunks, token) {
      const startIndex = token.start._index;
      const startBufferIndex = token.start._bufferIndex;
      const endIndex = token.end._index;
      const endBufferIndex = token.end._bufferIndex;
      /** @type {Chunk[]} */

      let view;

      if (startIndex === endIndex) {
        // @ts-expect-error `_bufferIndex` is used on string chunks.
        view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
      } else {
        view = chunks.slice(startIndex, endIndex);

        if (startBufferIndex > -1) {
          // @ts-expect-error `_bufferIndex` is used on string chunks.
          view[0] = view[0].slice(startBufferIndex);
        }

        if (endBufferIndex > 0) {
          // @ts-expect-error `_bufferIndex` is used on string chunks.
          view.push(chunks[endIndex].slice(0, endBufferIndex));
        }
      }

      return view
    }
    /**
     * Get the string value of a slice of chunks.
     *
     * @param {Chunk[]} chunks
     * @param {boolean} [expandTabs=false]
     * @returns {string}
     */

    function serializeChunks(chunks, expandTabs) {
      let index = -1;
      /** @type {string[]} */

      const result = [];
      /** @type {boolean|undefined} */

      let atTab;

      while (++index < chunks.length) {
        const chunk = chunks[index];
        /** @type {string} */

        let value;

        if (typeof chunk === 'string') {
          value = chunk;
        } else
          switch (chunk) {
            case -5: {
              value = '\r';
              break
            }

            case -4: {
              value = '\n';
              break
            }

            case -3: {
              value = '\r' + '\n';
              break
            }

            case -2: {
              value = expandTabs ? ' ' : '\t';
              break
            }

            case -1: {
              if (!expandTabs && atTab) continue
              value = ' ';
              break
            }

            default: {
              // Currently only replacement character.
              value = String.fromCharCode(chunk);
            }
          }

        atTab = chunk === -2;
        result.push(value);
      }

      return result.join('')
    }

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     */
    /** @type {Extension['document']} */

    const document$1 = {
      [42]: list,
      [43]: list,
      [45]: list,
      [48]: list,
      [49]: list,
      [50]: list,
      [51]: list,
      [52]: list,
      [53]: list,
      [54]: list,
      [55]: list,
      [56]: list,
      [57]: list,
      [62]: blockQuote
    };
    /** @type {Extension['contentInitial']} */

    const contentInitial = {
      [91]: definition
    };
    /** @type {Extension['flowInitial']} */

    const flowInitial = {
      [-2]: codeIndented,
      [-1]: codeIndented,
      [32]: codeIndented
    };
    /** @type {Extension['flow']} */

    const flow = {
      [35]: headingAtx,
      [42]: thematicBreak,
      [45]: [setextUnderline, thematicBreak],
      [60]: htmlFlow,
      [61]: setextUnderline,
      [95]: thematicBreak,
      [96]: codeFenced,
      [126]: codeFenced
    };
    /** @type {Extension['string']} */

    const string = {
      [38]: characterReference,
      [92]: characterEscape
    };
    /** @type {Extension['text']} */

    const text$1 = {
      [-5]: lineEnding,
      [-4]: lineEnding,
      [-3]: lineEnding,
      [33]: labelStartImage,
      [38]: characterReference,
      [42]: attention,
      [60]: [autolink, htmlText],
      [91]: labelStartLink,
      [92]: [hardBreakEscape, characterEscape],
      [93]: labelEnd,
      [95]: attention,
      [96]: codeText
    };
    /** @type {Extension['insideSpan']} */

    const insideSpan = {
      null: [attention, resolver]
    };
    /** @type {Extension['attentionMarkers']} */

    const attentionMarkers = {
      null: [42, 95]
    };
    /** @type {Extension['disable']} */

    const disable = {
      null: []
    };

    var defaultConstructs = /*#__PURE__*/Object.freeze({
        __proto__: null,
        document: document$1,
        contentInitial: contentInitial,
        flowInitial: flowInitial,
        flow: flow,
        string: string,
        text: text$1,
        insideSpan: insideSpan,
        attentionMarkers: attentionMarkers,
        disable: disable
    });

    /**
     * @typedef {import('micromark-util-types').InitialConstruct} InitialConstruct
     * @typedef {import('micromark-util-types').FullNormalizedExtension} FullNormalizedExtension
     * @typedef {import('micromark-util-types').ParseOptions} ParseOptions
     * @typedef {import('micromark-util-types').ParseContext} ParseContext
     * @typedef {import('micromark-util-types').Create} Create
     */
    /**
     * @param {ParseOptions} [options]
     * @returns {ParseContext}
     */

    function parse(options = {}) {
      /** @type {FullNormalizedExtension} */
      // @ts-expect-error `defaultConstructs` is full, so the result will be too.
      const constructs = combineExtensions(
        // @ts-expect-error Same as above.
        [defaultConstructs].concat(options.extensions || [])
      );
      /** @type {ParseContext} */

      const parser = {
        defined: [],
        lazy: {},
        constructs,
        content: create(content$1),
        document: create(document$2),
        flow: create(flow$1),
        string: create(string$1),
        text: create(text$2)
      };
      return parser
      /**
       * @param {InitialConstruct} initial
       */

      function create(initial) {
        return creator
        /** @type {Create} */

        function creator(from) {
          return createTokenizer(parser, initial, from)
        }
      }
    }

    /**
     * @typedef {import('micromark-util-types').Event} Event
     */
    /**
     * @param {Event[]} events
     * @returns {Event[]}
     */

    function postprocess(events) {
      while (!subtokenize(events)) {
        // Empty
      }

      return events
    }

    /**
     * @typedef {import('micromark-util-types').Encoding} Encoding
     * @typedef {import('micromark-util-types').Value} Value
     * @typedef {import('micromark-util-types').Chunk} Chunk
     * @typedef {import('micromark-util-types').Code} Code
     */

    /**
     * @callback Preprocessor
     * @param {Value} value
     * @param {Encoding} [encoding]
     * @param {boolean} [end=false]
     * @returns {Chunk[]}
     */
    const search = /[\0\t\n\r]/g;
    /**
     * @returns {Preprocessor}
     */

    function preprocess() {
      let column = 1;
      let buffer = '';
      /** @type {boolean|undefined} */

      let start = true;
      /** @type {boolean|undefined} */

      let atCarriageReturn;
      return preprocessor
      /** @type {Preprocessor} */

      function preprocessor(value, encoding, end) {
        /** @type {Chunk[]} */
        const chunks = [];
        /** @type {RegExpMatchArray|null} */

        let match;
        /** @type {number} */

        let next;
        /** @type {number} */

        let startPosition;
        /** @type {number} */

        let endPosition;
        /** @type {Code} */

        let code; // @ts-expect-error `Buffer` does allow an encoding.

        value = buffer + value.toString(encoding);
        startPosition = 0;
        buffer = '';

        if (start) {
          if (value.charCodeAt(0) === 65279) {
            startPosition++;
          }

          start = undefined;
        }

        while (startPosition < value.length) {
          search.lastIndex = startPosition;
          match = search.exec(value);
          endPosition =
            match && match.index !== undefined ? match.index : value.length;
          code = value.charCodeAt(endPosition);

          if (!match) {
            buffer = value.slice(startPosition);
            break
          }

          if (code === 10 && startPosition === endPosition && atCarriageReturn) {
            chunks.push(-3);
            atCarriageReturn = undefined;
          } else {
            if (atCarriageReturn) {
              chunks.push(-5);
              atCarriageReturn = undefined;
            }

            if (startPosition < endPosition) {
              chunks.push(value.slice(startPosition, endPosition));
              column += endPosition - startPosition;
            }

            switch (code) {
              case 0: {
                chunks.push(65533);
                column++;
                break
              }

              case 9: {
                next = Math.ceil(column / 4) * 4;
                chunks.push(-2);

                while (column++ < next) chunks.push(-1);

                break
              }

              case 10: {
                chunks.push(-4);
                column = 1;
                break
              }

              default: {
                atCarriageReturn = true;
                column = 1;
              }
            }
          }

          startPosition = endPosition + 1;
        }

        if (end) {
          if (atCarriageReturn) chunks.push(-5);
          if (buffer) chunks.push(buffer);
          chunks.push(null);
        }

        return chunks
      }
    }

    /**
     * @typedef {import('micromark-util-types').Options} Options
     * @typedef {import('micromark-util-types').Value} Value
     * @typedef {import('micromark-util-types').Encoding} Encoding
     */
    /**
     * @param value Markdown to parse (`string` or `Buffer`).
     * @param [encoding] Character encoding to understand `value` as when it’s a `Buffer` (`string`, default: `'utf8'`).
     * @param [options] Configuration
     */

    const micromark =
      /**
       * @type {(
       *   ((value: Value, encoding: Encoding, options?: Options) => string) &
       *   ((value: Value, options?: Options) => string)
       * )}
       */

      /**
       * @param {Value} value
       * @param {Encoding} [encoding]
       * @param {Options} [options]
       */
      function (value, encoding, options) {
        if (typeof encoding !== 'string') {
          options = encoding;
          encoding = undefined;
        }

        return compile(options)(
          postprocess(
            parse(options).document().write(preprocess()(value, encoding, true))
          )
        )
      };

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').ConstructRecord} ConstructRecord
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Previous} Previous
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Event} Event
     * @typedef {import('micromark-util-types').Code} Code
     */
    const www = {
      tokenize: tokenizeWww,
      partial: true
    };
    const domain = {
      tokenize: tokenizeDomain,
      partial: true
    };
    const path = {
      tokenize: tokenizePath,
      partial: true
    };
    const punctuation = {
      tokenize: tokenizePunctuation,
      partial: true
    };
    const namedCharacterReference = {
      tokenize: tokenizeNamedCharacterReference,
      partial: true
    };
    const wwwAutolink = {
      tokenize: tokenizeWwwAutolink,
      previous: previousWww
    };
    const httpAutolink = {
      tokenize: tokenizeHttpAutolink,
      previous: previousHttp
    };
    const emailAutolink = {
      tokenize: tokenizeEmailAutolink,
      previous: previousEmail
    };
    /** @type {ConstructRecord} */

    const text = {};
    /** @type {Extension} */

    const gfmAutolinkLiteral = {
      text
    };
    let code = 48; // Add alphanumerics.

    while (code < 123) {
      text[code] = emailAutolink;
      code++;
      if (code === 58) code = 65;
      else if (code === 91) code = 97;
    }

    text[43] = emailAutolink;
    text[45] = emailAutolink;
    text[46] = emailAutolink;
    text[95] = emailAutolink;
    text[72] = [emailAutolink, httpAutolink];
    text[104] = [emailAutolink, httpAutolink];
    text[87] = [emailAutolink, wwwAutolink];
    text[119] = [emailAutolink, wwwAutolink];
    /** @type {Tokenizer} */

    function tokenizeEmailAutolink(effects, ok, nok) {
      const self = this;
      /** @type {boolean} */

      let hasDot;
      /** @type {boolean|undefined} */

      let hasDigitInLastSegment;
      return start
      /** @type {State} */

      function start(code) {
        if (
          !gfmAtext(code) ||
          !previousEmail(self.previous) ||
          previousUnbalanced(self.events)
        ) {
          return nok(code)
        }

        effects.enter('literalAutolink');
        effects.enter('literalAutolinkEmail');
        return atext(code)
      }
      /** @type {State} */

      function atext(code) {
        if (gfmAtext(code)) {
          effects.consume(code);
          return atext
        }

        if (code === 64) {
          effects.consume(code);
          return label
        }

        return nok(code)
      }
      /** @type {State} */

      function label(code) {
        if (code === 46) {
          return effects.check(punctuation, done, dotContinuation)(code)
        }

        if (code === 45 || code === 95) {
          return effects.check(punctuation, nok, dashOrUnderscoreContinuation)(code)
        }

        if (asciiAlphanumeric(code)) {
          if (!hasDigitInLastSegment && asciiDigit(code)) {
            hasDigitInLastSegment = true;
          }

          effects.consume(code);
          return label
        }

        return done(code)
      }
      /** @type {State} */

      function dotContinuation(code) {
        effects.consume(code);
        hasDot = true;
        hasDigitInLastSegment = undefined;
        return label
      }
      /** @type {State} */

      function dashOrUnderscoreContinuation(code) {
        effects.consume(code);
        return afterDashOrUnderscore
      }
      /** @type {State} */

      function afterDashOrUnderscore(code) {
        if (code === 46) {
          return effects.check(punctuation, nok, dotContinuation)(code)
        }

        return label(code)
      }
      /** @type {State} */

      function done(code) {
        if (hasDot && !hasDigitInLastSegment) {
          effects.exit('literalAutolinkEmail');
          effects.exit('literalAutolink');
          return ok(code)
        }

        return nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeWwwAutolink(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        if (
          (code !== 87 && code !== 119) ||
          !previousWww(self.previous) ||
          previousUnbalanced(self.events)
        ) {
          return nok(code)
        }

        effects.enter('literalAutolink');
        effects.enter('literalAutolinkWww'); // For `www.` we check instead of attempt, because when it matches, GH
        // treats it as part of a domain (yes, it says a valid domain must come
        // after `www.`, but that’s not how it’s implemented by them).

        return effects.check(
          www,
          effects.attempt(domain, effects.attempt(path, done), nok),
          nok
        )(code)
      }
      /** @type {State} */

      function done(code) {
        effects.exit('literalAutolinkWww');
        effects.exit('literalAutolink');
        return ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeHttpAutolink(effects, ok, nok) {
      const self = this;
      return start
      /** @type {State} */

      function start(code) {
        if (
          (code !== 72 && code !== 104) ||
          !previousHttp(self.previous) ||
          previousUnbalanced(self.events)
        ) {
          return nok(code)
        }

        effects.enter('literalAutolink');
        effects.enter('literalAutolinkHttp');
        effects.consume(code);
        return t1
      }
      /** @type {State} */

      function t1(code) {
        if (code === 84 || code === 116) {
          effects.consume(code);
          return t2
        }

        return nok(code)
      }
      /** @type {State} */

      function t2(code) {
        if (code === 84 || code === 116) {
          effects.consume(code);
          return p
        }

        return nok(code)
      }
      /** @type {State} */

      function p(code) {
        if (code === 80 || code === 112) {
          effects.consume(code);
          return s
        }

        return nok(code)
      }
      /** @type {State} */

      function s(code) {
        if (code === 83 || code === 115) {
          effects.consume(code);
          return colon
        }

        return colon(code)
      }
      /** @type {State} */

      function colon(code) {
        if (code === 58) {
          effects.consume(code);
          return slash1
        }

        return nok(code)
      }
      /** @type {State} */

      function slash1(code) {
        if (code === 47) {
          effects.consume(code);
          return slash2
        }

        return nok(code)
      }
      /** @type {State} */

      function slash2(code) {
        if (code === 47) {
          effects.consume(code);
          return after
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        return code === null ||
          asciiControl(code) ||
          unicodeWhitespace(code) ||
          unicodePunctuation(code)
          ? nok(code)
          : effects.attempt(domain, effects.attempt(path, done), nok)(code)
      }
      /** @type {State} */

      function done(code) {
        effects.exit('literalAutolinkHttp');
        effects.exit('literalAutolink');
        return ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeWww(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.consume(code);
        return w2
      }
      /** @type {State} */

      function w2(code) {
        if (code === 87 || code === 119) {
          effects.consume(code);
          return w3
        }

        return nok(code)
      }
      /** @type {State} */

      function w3(code) {
        if (code === 87 || code === 119) {
          effects.consume(code);
          return dot
        }

        return nok(code)
      }
      /** @type {State} */

      function dot(code) {
        if (code === 46) {
          effects.consume(code);
          return after
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        return code === null || markdownLineEnding(code) ? nok(code) : ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeDomain(effects, ok, nok) {
      /** @type {boolean|undefined} */
      let hasUnderscoreInLastSegment;
      /** @type {boolean|undefined} */

      let hasUnderscoreInLastLastSegment;
      return domain
      /** @type {State} */

      function domain(code) {
        if (code === 38) {
          return effects.check(
            namedCharacterReference,
            done,
            punctuationContinuation
          )(code)
        }

        if (code === 46 || code === 95) {
          return effects.check(punctuation, done, punctuationContinuation)(code)
        } // GH documents that only alphanumerics (other than `-`, `.`, and `_`) can
        // occur, which sounds like ASCII only, but they also support `www.點看.com`,
        // so that’s Unicode.
        // Instead of some new production for Unicode alphanumerics, markdown
        // already has that for Unicode punctuation and whitespace, so use those.

        if (
          code === null ||
          asciiControl(code) ||
          unicodeWhitespace(code) ||
          (code !== 45 && unicodePunctuation(code))
        ) {
          return done(code)
        }

        effects.consume(code);
        return domain
      }
      /** @type {State} */

      function punctuationContinuation(code) {
        if (code === 46) {
          hasUnderscoreInLastLastSegment = hasUnderscoreInLastSegment;
          hasUnderscoreInLastSegment = undefined;
          effects.consume(code);
          return domain
        }

        if (code === 95) hasUnderscoreInLastSegment = true;
        effects.consume(code);
        return domain
      }
      /** @type {State} */

      function done(code) {
        if (!hasUnderscoreInLastLastSegment && !hasUnderscoreInLastSegment) {
          return ok(code)
        }

        return nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizePath(effects, ok) {
      let balance = 0;
      return inPath
      /** @type {State} */

      function inPath(code) {
        if (code === 38) {
          return effects.check(
            namedCharacterReference,
            ok,
            continuedPunctuation
          )(code)
        }

        if (code === 40) {
          balance++;
        }

        if (code === 41) {
          return effects.check(
            punctuation,
            parenAtPathEnd,
            continuedPunctuation
          )(code)
        }

        if (pathEnd(code)) {
          return ok(code)
        }

        if (trailingPunctuation(code)) {
          return effects.check(punctuation, ok, continuedPunctuation)(code)
        }

        effects.consume(code);
        return inPath
      }
      /** @type {State} */

      function continuedPunctuation(code) {
        effects.consume(code);
        return inPath
      }
      /** @type {State} */

      function parenAtPathEnd(code) {
        balance--;
        return balance < 0 ? ok(code) : continuedPunctuation(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeNamedCharacterReference(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.consume(code);
        return inside
      }
      /** @type {State} */

      function inside(code) {
        if (asciiAlpha(code)) {
          effects.consume(code);
          return inside
        }

        if (code === 59) {
          effects.consume(code);
          return after
        }

        return nok(code)
      }
      /** @type {State} */

      function after(code) {
        // If the named character reference is followed by the end of the path, it’s
        // not continued punctuation.
        return pathEnd(code) ? ok(code) : nok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizePunctuation(effects, ok, nok) {
      return start
      /** @type {State} */

      function start(code) {
        effects.consume(code);
        return after
      }
      /** @type {State} */

      function after(code) {
        // Check the next.
        if (trailingPunctuation(code)) {
          effects.consume(code);
          return after
        } // If the punctuation marker is followed by the end of the path, it’s not
        // continued punctuation.

        return pathEnd(code) ? ok(code) : nok(code)
      }
    }
    /**
     * @param {Code} code
     * @returns {boolean}
     */

    function trailingPunctuation(code) {
      return (
        code === 33 ||
        code === 34 ||
        code === 39 ||
        code === 41 ||
        code === 42 ||
        code === 44 ||
        code === 46 ||
        code === 58 ||
        code === 59 ||
        code === 60 ||
        code === 63 ||
        code === 95 ||
        code === 126
      )
    }
    /**
     * @param {Code} code
     * @returns {boolean}
     */

    function pathEnd(code) {
      return code === null || code === 60 || markdownLineEndingOrSpace(code)
    }
    /**
     * @param {Code} code
     * @returns {boolean}
     */

    function gfmAtext(code) {
      return (
        code === 43 ||
        code === 45 ||
        code === 46 ||
        code === 95 ||
        asciiAlphanumeric(code)
      )
    }
    /** @type {Previous} */

    function previousWww(code) {
      return (
        code === null ||
        code === 40 ||
        code === 42 ||
        code === 95 ||
        code === 126 ||
        markdownLineEndingOrSpace(code)
      )
    }
    /** @type {Previous} */

    function previousHttp(code) {
      return code === null || !asciiAlpha(code)
    }
    /** @type {Previous} */

    function previousEmail(code) {
      return code !== 47 && previousHttp(code)
    }
    /**
     * @param {Event[]} events
     * @returns {boolean}
     */

    function previousUnbalanced(events) {
      let index = events.length;
      let result = false;

      while (index--) {
        const token = events[index][1];

        if (
          (token.type === 'labelLink' || token.type === 'labelImage') &&
          !token._balanced
        ) {
          result = true;
          break
        } // @ts-expect-error If we’ve seen this token, and it was marked as not
        // having any unbalanced bracket before it, we can exit.

        if (token._gfmAutolinkLiteralWalkedInto) {
          result = false;
          break
        }
      }

      if (events.length > 0 && !result) {
        // @ts-expect-error Mark the last token as “walked into” w/o finding
        // anything.
        events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
      }

      return result
    }

    /**
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     * @typedef {import('micromark-util-types').Handle} Handle
     * @typedef {import('micromark-util-types').CompileContext} CompileContext
     * @typedef {import('micromark-util-types').Token} Token
     */
    /** @type {HtmlExtension} */

    const gfmAutolinkLiteralHtml = {
      exit: {
        literalAutolinkEmail,
        literalAutolinkHttp,
        literalAutolinkWww
      }
    };
    /** @type {Handle} */

    function literalAutolinkWww(token) {
      anchorFromToken.call(this, token, 'http://');
    }
    /** @type {Handle} */

    function literalAutolinkEmail(token) {
      anchorFromToken.call(this, token, 'mailto:');
    }
    /** @type {Handle} */

    function literalAutolinkHttp(token) {
      anchorFromToken.call(this, token);
    }
    /**
     * @this CompileContext
     * @param {Token} token
     * @param {string} [protocol]
     * @returns {void}
     */

    function anchorFromToken(token, protocol) {
      const url = this.sliceSerialize(token);
      this.tag('<a href="' + sanitizeUri((protocol || '') + url) + '">');
      this.raw(this.encode(url));
      this.tag('</a>');
    }

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Exiter} Exiter
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Event} Event
     */
    const indent = {
      tokenize: tokenizeIndent,
      partial: true
    };
    /**
     * @returns {Extension}
     */

    function gfmFootnote() {
      /** @type {Extension} */
      return {
        document: {
          [91]: {
            tokenize: tokenizeDefinitionStart,
            continuation: {
              tokenize: tokenizeDefinitionContinuation
            },
            exit: gfmFootnoteDefinitionEnd
          }
        },
        text: {
          [91]: {
            tokenize: tokenizeGfmFootnoteCall
          },
          [93]: {
            add: 'after',
            tokenize: tokenizePotentialGfmFootnoteCall,
            resolveTo: resolveToPotentialGfmFootnoteCall
          }
        }
      }
    }
    /** @type {Tokenizer} */

    function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
      const self = this;
      let index = self.events.length;
      /** @type {string[]} */
      // @ts-expect-error It’s fine!

      const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
      /** @type {Token} */

      let labelStart; // Find an opening.

      while (index--) {
        const token = self.events[index][1];

        if (token.type === 'labelImage') {
          labelStart = token;
          break
        } // Exit if we’ve walked far enough.

        if (
          token.type === 'gfmFootnoteCall' ||
          token.type === 'labelLink' ||
          token.type === 'label' ||
          token.type === 'image' ||
          token.type === 'link'
        ) {
          break
        }
      }

      return start
      /** @type {State} */

      function start(code) {
        if (!labelStart || !labelStart._balanced) {
          return nok(code)
        }

        const id = normalizeIdentifier(
          self.sliceSerialize({
            start: labelStart.end,
            end: self.now()
          })
        );

        if (id.charCodeAt(0) !== 94 || !defined.includes(id.slice(1))) {
          return nok(code)
        }

        effects.enter('gfmFootnoteCallLabelMarker');
        effects.consume(code);
        effects.exit('gfmFootnoteCallLabelMarker');
        return ok(code)
      }
    }
    /** @type {Resolver} */

    function resolveToPotentialGfmFootnoteCall(events, context) {
      let index = events.length;

      while (index--) {
        if (
          events[index][1].type === 'labelImage' &&
          events[index][0] === 'enter'
        ) {
          events[index][1];
          break
        }
      }

      // Change the `labelImageMarker` to a `data`.
      events[index + 1][1].type = 'data';
      events[index + 3][1].type = 'gfmFootnoteCallLabelMarker'; // The whole (without `!`):

      const call = {
        type: 'gfmFootnoteCall',
        start: Object.assign({}, events[index + 3][1].start),
        end: Object.assign({}, events[events.length - 1][1].end)
      }; // The `^` marker

      const marker = {
        type: 'gfmFootnoteCallMarker',
        start: Object.assign({}, events[index + 3][1].end),
        end: Object.assign({}, events[index + 3][1].end)
      }; // Increment the end 1 character.

      marker.end.column++;
      marker.end.offset++;
      marker.end._bufferIndex++;
      const string = {
        type: 'gfmFootnoteCallString',
        start: Object.assign({}, marker.end),
        end: Object.assign({}, events[events.length - 1][1].start)
      };
      const chunk = {
        type: 'chunkString',
        contentType: 'string',
        start: Object.assign({}, string.start),
        end: Object.assign({}, string.end)
      };
      /** @type {Event[]} */

      const replacement = [
        // Take the `labelImageMarker` (now `data`, the `!`)
        events[index + 1],
        events[index + 2],
        ['enter', call, context], // The `[`
        events[index + 3],
        events[index + 4], // The `^`.
        ['enter', marker, context],
        ['exit', marker, context], // Everything in between.
        ['enter', string, context],
        ['enter', chunk, context],
        ['exit', chunk, context],
        ['exit', string, context], // The ending (`]`, properly parsed and labelled).
        events[events.length - 2],
        events[events.length - 1],
        ['exit', call, context]
      ];
      events.splice(index, events.length - index + 1, ...replacement);
      return events
    }
    /** @type {Tokenizer} */

    function tokenizeGfmFootnoteCall(effects, ok, nok) {
      const self = this;
      /** @type {string[]} */
      // @ts-expect-error It’s fine!

      const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
      let size = 0;
      /** @type {boolean} */

      let data;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('gfmFootnoteCall');
        effects.enter('gfmFootnoteCallLabelMarker');
        effects.consume(code);
        effects.exit('gfmFootnoteCallLabelMarker');
        return callStart
      }
      /** @type {State} */

      function callStart(code) {
        if (code !== 94) return nok(code)
        effects.enter('gfmFootnoteCallMarker');
        effects.consume(code);
        effects.exit('gfmFootnoteCallMarker');
        effects.enter('gfmFootnoteCallString');
        effects.enter('chunkString').contentType = 'string';
        return callData
      }
      /** @type {State} */

      function callData(code) {
        /** @type {Token} */
        let token;

        if (code === null || code === 91 || size++ > 999) {
          return nok(code)
        }

        if (code === 93) {
          if (!data) {
            return nok(code)
          }

          effects.exit('chunkString');
          token = effects.exit('gfmFootnoteCallString');
          return defined.includes(normalizeIdentifier(self.sliceSerialize(token)))
            ? end(code)
            : nok(code)
        }

        effects.consume(code);

        if (!markdownLineEndingOrSpace(code)) {
          data = true;
        }

        return code === 92 ? callEscape : callData
      }
      /** @type {State} */

      function callEscape(code) {
        if (code === 91 || code === 92 || code === 93) {
          effects.consume(code);
          size++;
          return callData
        }

        return callData(code)
      }
      /** @type {State} */

      function end(code) {
        effects.enter('gfmFootnoteCallLabelMarker');
        effects.consume(code);
        effects.exit('gfmFootnoteCallLabelMarker');
        effects.exit('gfmFootnoteCall');
        return ok
      }
    }
    /** @type {Tokenizer} */

    function tokenizeDefinitionStart(effects, ok, nok) {
      const self = this;
      /** @type {string[]} */
      // @ts-expect-error It’s fine!

      const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
      /** @type {string} */

      let identifier;
      let size = 0;
      /** @type {boolean|undefined} */

      let data;
      return start
      /** @type {State} */

      function start(code) {
        effects.enter('gfmFootnoteDefinition')._container = true;
        effects.enter('gfmFootnoteDefinitionLabel');
        effects.enter('gfmFootnoteDefinitionLabelMarker');
        effects.consume(code);
        effects.exit('gfmFootnoteDefinitionLabelMarker');
        return labelStart
      }
      /** @type {State} */

      function labelStart(code) {
        if (code === 94) {
          effects.enter('gfmFootnoteDefinitionMarker');
          effects.consume(code);
          effects.exit('gfmFootnoteDefinitionMarker');
          effects.enter('gfmFootnoteDefinitionLabelString');
          return atBreak
        }

        return nok(code)
      }
      /** @type {State} */

      function atBreak(code) {
        /** @type {Token} */
        let token;

        if (code === null || code === 91 || size > 999) {
          return nok(code)
        }

        if (code === 93) {
          if (!data) {
            return nok(code)
          }

          token = effects.exit('gfmFootnoteDefinitionLabelString');
          identifier = normalizeIdentifier(self.sliceSerialize(token));
          effects.enter('gfmFootnoteDefinitionLabelMarker');
          effects.consume(code);
          effects.exit('gfmFootnoteDefinitionLabelMarker');
          effects.exit('gfmFootnoteDefinitionLabel');
          return labelAfter
        }

        if (markdownLineEnding(code)) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          size++;
          return atBreak
        }

        effects.enter('chunkString').contentType = 'string';
        return label(code)
      }
      /** @type {State} */

      function label(code) {
        if (
          code === null ||
          markdownLineEnding(code) ||
          code === 91 ||
          code === 93 ||
          size > 999
        ) {
          effects.exit('chunkString');
          return atBreak(code)
        }

        if (!markdownLineEndingOrSpace(code)) {
          data = true;
        }

        size++;
        effects.consume(code);
        return code === 92 ? labelEscape : label
      }
      /** @type {State} */

      function labelEscape(code) {
        if (code === 91 || code === 92 || code === 93) {
          effects.consume(code);
          size++;
          return label
        }

        return label(code)
      }
      /** @type {State} */

      function labelAfter(code) {
        if (code === 58) {
          effects.enter('definitionMarker');
          effects.consume(code);
          effects.exit('definitionMarker'); // Any whitespace after the marker is eaten, forming indented code
          // is not possible.
          // No space is also fine, just like a block quote marker.

          return factorySpace(effects, done, 'gfmFootnoteDefinitionWhitespace')
        }

        return nok(code)
      }
      /** @type {State} */

      function done(code) {
        if (!defined.includes(identifier)) {
          defined.push(identifier);
        }

        return ok(code)
      }
    }
    /** @type {Tokenizer} */

    function tokenizeDefinitionContinuation(effects, ok, nok) {
      // Either a blank line, which is okay, or an indented thing.
      return effects.check(blankLine, ok, effects.attempt(indent, ok, nok))
    }
    /** @type {Exiter} */

    function gfmFootnoteDefinitionEnd(effects) {
      effects.exit('gfmFootnoteDefinition');
    }
    /** @type {Tokenizer} */

    function tokenizeIndent(effects, ok, nok) {
      const self = this;
      return factorySpace(
        effects,
        afterPrefix,
        'gfmFootnoteDefinitionIndent',
        4 + 1
      )
      /** @type {State} */

      function afterPrefix(code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
          tail[1].type === 'gfmFootnoteDefinitionIndent' &&
          tail[2].sliceSerialize(tail[1], true).length === 4
          ? ok(code)
          : nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     * @typedef {import('micromark-util-types').CompileContext} CompileContext
     *
     * @typedef Options
     * @property {string} [clobberPrefix='user-content-']
     *   Prefix to use before the `id` attribute to prevent it from *clobbering*.
     *   attributes.
     *   DOM clobbering is this:
     *
     *   ```html
     *   <p id=x></p>
     *   <script>alert(x)</script>
     *   ```
     *
     *   Elements by their ID are made available in browsers on the `window` object.
     *   Using a prefix prevents this from being a problem.
     * @property {string} [label='Footnotes']
     *   Label to use for the footnotes section.
     *   Affects screen reader users.
     *   Change it if you’re authoring in a different language.
     * @property {string} [backLabel='Back to content']
     *   Label to use from backreferences back to their footnote call.
     *   Affects screen reader users.
     *   Change it if you’re authoring in a different language.
     */
    const own = {}.hasOwnProperty;
    /**
     * @param {Options} [options={}]
     * @returns {HtmlExtension}
     */

    function gfmFootnoteHtml(options = {}) {
      const label = options.label || 'Footnotes';
      const backLabel = options.backLabel || 'Back to content';
      const clobberPrefix =
        options.clobberPrefix === undefined || options.clobberPrefix === null
          ? 'user-content-'
          : options.clobberPrefix;
      return {
        enter: {
          gfmFootnoteDefinition() {
            // @ts-expect-error It’s defined.
            this.getData('tightStack').push(false);
          },

          gfmFootnoteDefinitionLabelString() {
            this.buffer();
          },

          gfmFootnoteCallString() {
            this.buffer();
          }
        },
        exit: {
          gfmFootnoteDefinition() {
            /** @type {Record<string, string>} */
            // @ts-expect-error It’s fine.
            let definitions = this.getData('gfmFootnoteDefinitions');
            /** @type {string[]} */
            // @ts-expect-error: It’s fine

            const stack = this.getData('gfmFootnoteDefinitionStack');
            /** @type {string} */
            // @ts-expect-error: It’s fine

            const current = stack.pop();
            const value = this.resume();
            if (!definitions)
              this.setData('gfmFootnoteDefinitions', (definitions = {}));
            if (!own.call(definitions, current)) definitions[current] = value; // @ts-expect-error It’s defined.

            this.getData('tightStack').pop();
            this.setData('slurpOneLineEnding', true); // “Hack” to prevent a line ending from showing up if we’re in a definition in
            // an empty list item.

            this.setData('lastWasTag');
          },

          gfmFootnoteDefinitionLabelString(token) {
            /** @type {string[]} */
            // @ts-expect-error: It’s fine
            let stack = this.getData('gfmFootnoteDefinitionStack');
            if (!stack) this.setData('gfmFootnoteDefinitionStack', (stack = []));
            stack.push(normalizeIdentifier(this.sliceSerialize(token)));
            this.resume(); // Drop the label.

            this.buffer(); // Get ready for a value.
          },

          gfmFootnoteCallString(token) {
            /** @type {string[]|undefined} */
            // @ts-expect-error It’s fine.
            let calls = this.getData('gfmFootnoteCallOrder');
            /** @type {Record.<string, number>|undefined} */
            // @ts-expect-error It’s fine.

            let counts = this.getData('gfmFootnoteCallCounts');
            const id = normalizeIdentifier(this.sliceSerialize(token));
            /** @type {number} */

            let counter;
            this.resume();
            if (!calls) this.setData('gfmFootnoteCallOrder', (calls = []));
            if (!counts) this.setData('gfmFootnoteCallCounts', (counts = {}));
            const index = calls.indexOf(id);
            const safeId = sanitizeUri(id.toLowerCase());

            if (index === -1) {
              calls.push(id);
              counts[id] = 1;
              counter = calls.length;
            } else {
              counts[id]++;
              counter = index + 1;
            }

            const reuseCounter = counts[id];
            this.tag(
              '<sup><a href="#' +
                clobberPrefix +
                'fn-' +
                safeId +
                '" id="' +
                clobberPrefix +
                'fnref-' +
                safeId +
                (reuseCounter > 1 ? '-' + reuseCounter : '') +
                '" data-footnote-ref="" aria-describedby="footnote-label">' +
                String(counter) +
                '</a></sup>'
            );
          },

          null() {
            /** @type {string[]} */
            // @ts-expect-error It’s fine.
            const calls = this.getData('gfmFootnoteCallOrder') || [];
            /** @type {Record.<string, number>} */
            // @ts-expect-error It’s fine.

            const counts = this.getData('gfmFootnoteCallCounts') || {};
            /** @type {Record<string, string>} */
            // @ts-expect-error It’s fine.

            const definitions = this.getData('gfmFootnoteDefinitions') || {};
            let index = -1;

            if (calls.length > 0) {
              this.lineEndingIfNeeded();
              this.tag(
                '<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">'
              );
              this.raw(this.encode(label));
              this.tag('</h2>');
              this.lineEndingIfNeeded();
              this.tag('<ol>');
            }

            while (++index < calls.length) {
              // Called definitions are always defined.
              const id = calls[index];
              const safeId = sanitizeUri(id.toLowerCase());
              let referenceIndex = 0;
              /** @type {string[]} */

              const references = [];

              while (++referenceIndex <= counts[id]) {
                references.push(
                  '<a href="#' +
                    clobberPrefix +
                    'fnref-' +
                    safeId +
                    (referenceIndex > 1 ? '-' + referenceIndex : '') +
                    '" data-footnote-backref="" class="data-footnote-backref" aria-label="' +
                    this.encode(backLabel) +
                    '">↩' +
                    (referenceIndex > 1
                      ? '<sup>' + referenceIndex + '</sup>'
                      : '') +
                    '</a>'
                );
              }

              const reference = references.join(' ');
              let injected = false;
              this.lineEndingIfNeeded();
              this.tag('<li id="' + clobberPrefix + 'fn-' + safeId + '">');
              this.lineEndingIfNeeded();
              this.tag(
                definitions[id].replace(
                  /<\/p>(?:\r?\n|\r)?$/,
                  (
                    /** @type {string} */
                    $0
                  ) => {
                    injected = true;
                    return ' ' + reference + $0
                  }
                )
              );

              if (!injected) {
                this.lineEndingIfNeeded();
                this.tag(reference);
              }

              this.lineEndingIfNeeded();
              this.tag('</li>');
            }

            if (calls.length > 0) {
              this.lineEndingIfNeeded();
              this.tag('</ol>');
              this.lineEndingIfNeeded();
              this.tag('</section>');
            }
          }
        }
      }
    }

    /**
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     */

    /** @type {HtmlExtension} */
    const gfmStrikethroughHtml = {
      enter: {
        strikethrough() {
          this.tag('<del>');
        }
      },
      exit: {
        strikethrough() {
          this.tag('</del>');
        }
      }
    };

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').Event} Event
     */

    /**
     * @param {Options} [options]
     * @returns {Extension}
     */
    function gfmStrikethrough(options = {}) {
      let single = options.singleTilde;
      const tokenizer = {
        tokenize: tokenizeStrikethrough,
        resolveAll: resolveAllStrikethrough
      };

      if (single === null || single === undefined) {
        single = true;
      }

      return {
        text: {
          [126]: tokenizer
        },
        insideSpan: {
          null: [tokenizer]
        },
        attentionMarkers: {
          null: [126]
        }
      }
      /**
       * Take events and resolve strikethrough.
       *
       * @type {Resolver}
       */

      function resolveAllStrikethrough(events, context) {
        let index = -1; // Walk through all events.

        while (++index < events.length) {
          // Find a token that can close.
          if (
            events[index][0] === 'enter' &&
            events[index][1].type === 'strikethroughSequenceTemporary' &&
            events[index][1]._close
          ) {
            let open = index; // Now walk back to find an opener.

            while (open--) {
              // Find a token that can open the closer.
              if (
                events[open][0] === 'exit' &&
                events[open][1].type === 'strikethroughSequenceTemporary' &&
                events[open][1]._open && // If the sizes are the same:
                events[index][1].end.offset - events[index][1].start.offset ===
                  events[open][1].end.offset - events[open][1].start.offset
              ) {
                events[index][1].type = 'strikethroughSequence';
                events[open][1].type = 'strikethroughSequence';
                const strikethrough = {
                  type: 'strikethrough',
                  start: Object.assign({}, events[open][1].start),
                  end: Object.assign({}, events[index][1].end)
                };
                const text = {
                  type: 'strikethroughText',
                  start: Object.assign({}, events[open][1].end),
                  end: Object.assign({}, events[index][1].start)
                }; // Opening.

                const nextEvents = [
                  ['enter', strikethrough, context],
                  ['enter', events[open][1], context],
                  ['exit', events[open][1], context],
                  ['enter', text, context]
                ]; // Between.

                splice(
                  nextEvents,
                  nextEvents.length,
                  0,
                  resolveAll(
                    context.parser.constructs.insideSpan.null,
                    events.slice(open + 1, index),
                    context
                  )
                ); // Closing.

                splice(nextEvents, nextEvents.length, 0, [
                  ['exit', text, context],
                  ['enter', events[index][1], context],
                  ['exit', events[index][1], context],
                  ['exit', strikethrough, context]
                ]);
                splice(events, open - 1, index - open + 3, nextEvents);
                index = open + nextEvents.length - 2;
                break
              }
            }
          }
        }

        index = -1;

        while (++index < events.length) {
          if (events[index][1].type === 'strikethroughSequenceTemporary') {
            events[index][1].type = 'data';
          }
        }

        return events
      }
      /** @type {Tokenizer} */

      function tokenizeStrikethrough(effects, ok, nok) {
        const previous = this.previous;
        const events = this.events;
        let size = 0;
        return start
        /** @type {State} */

        function start(code) {
          if (
            previous === 126 &&
            events[events.length - 1][1].type !== 'characterEscape'
          ) {
            return nok(code)
          }

          effects.enter('strikethroughSequenceTemporary');
          return more(code)
        }
        /** @type {State} */

        function more(code) {
          const before = classifyCharacter(previous);

          if (code === 126) {
            // If this is the third marker, exit.
            if (size > 1) return nok(code)
            effects.consume(code);
            size++;
            return more
          }

          if (size < 2 && !single) return nok(code)
          const token = effects.exit('strikethroughSequenceTemporary');
          const after = classifyCharacter(code);
          token._open = !after || (after === 2 && Boolean(before));
          token._close = !before || (before === 2 && Boolean(after));
          return ok(code)
        }
      }
    }

    /**
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     */

    /**
     * @typedef {import('./syntax.js').Align} Align
     */
    const alignment = {
      null: '',
      left: ' align="left"',
      right: ' align="right"',
      center: ' align="center"'
    };
    /** @type {HtmlExtension} */

    const gfmTableHtml = {
      enter: {
        table(token) {
          this.lineEndingIfNeeded();
          this.tag('<table>'); // @ts-expect-error Custom.

          this.setData('tableAlign', token._align);
        },

        tableBody() {
          // Clear slurping line ending from the delimiter row.
          this.setData('slurpOneLineEnding');
          this.tag('<tbody>');
        },

        tableData() {
          /** @type {string|undefined} */
          const align = // @ts-expect-error Custom.
            alignment[this.getData('tableAlign')[this.getData('tableColumn')]];

          if (align === undefined) {
            // Capture results to ignore them.
            this.buffer();
          } else {
            this.lineEndingIfNeeded();
            this.tag('<td' + align + '>');
          }
        },

        tableHead() {
          this.lineEndingIfNeeded();
          this.tag('<thead>');
        },

        tableHeader() {
          this.lineEndingIfNeeded();
          this.tag(
            '<th' + // @ts-expect-error Custom.
              alignment[this.getData('tableAlign')[this.getData('tableColumn')]] +
              '>'
          );
        },

        tableRow() {
          this.setData('tableColumn', 0);
          this.lineEndingIfNeeded();
          this.tag('<tr>');
        }
      },
      exit: {
        // Overwrite the default code text data handler to unescape escaped pipes when
        // they are in tables.
        codeTextData(token) {
          let value = this.sliceSerialize(token);

          if (this.getData('tableAlign')) {
            value = value.replace(/\\([\\|])/g, replace);
          }

          this.raw(this.encode(value));
        },

        table() {
          this.setData('tableAlign'); // If there was no table body, make sure the slurping from the delimiter row
          // is cleared.

          this.setData('slurpAllLineEndings');
          this.lineEndingIfNeeded();
          this.tag('</table>');
        },

        tableBody() {
          this.lineEndingIfNeeded();
          this.tag('</tbody>');
        },

        tableData() {
          /** @type {number} */
          // @ts-expect-error Custom.
          const column = this.getData('tableColumn'); // @ts-expect-error Custom.

          if (column in this.getData('tableAlign')) {
            this.tag('</td>');
            this.setData('tableColumn', column + 1);
          } else {
            // Stop capturing.
            this.resume();
          }
        },

        tableHead() {
          this.lineEndingIfNeeded();
          this.tag('</thead>');
          this.setData('slurpOneLineEnding', true); // Slurp the line ending from the delimiter row.
        },

        tableHeader() {
          this.tag('</th>'); // @ts-expect-error Custom.

          this.setData('tableColumn', this.getData('tableColumn') + 1);
        },

        tableRow() {
          /** @type {Align[]} */
          // @ts-expect-error Custom.
          const align = this.getData('tableAlign');
          /** @type {number} */
          // @ts-expect-error Custom.

          let column = this.getData('tableColumn');

          while (column < align.length) {
            this.lineEndingIfNeeded(); // @ts-expect-error `null` is fine as an index.

            this.tag('<td' + alignment[align[column]] + '></td>');
            column++;
          }

          this.setData('tableColumn', column);
          this.lineEndingIfNeeded();
          this.tag('</tr>');
        }
      }
    };
    /**
     * @param {string} $0
     * @param {string} $1
     * @returns {string}
     */

    function replace($0, $1) {
      // Pipes work, backslashes don’t (but can’t escape pipes).
      return $1 === '|' ? $1 : $0
    }

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').Resolver} Resolver
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Token} Token
     */

    /** @type {Extension} */
    const gfmTable = {
      flow: {
        null: {
          tokenize: tokenizeTable,
          resolve: resolveTable
        }
      }
    };
    const nextPrefixedOrBlank = {
      tokenize: tokenizeNextPrefixedOrBlank,
      partial: true
    };
    /** @type {Resolver} */

    function resolveTable(events, context) {
      let index = -1;
      /** @type {boolean|undefined} */

      let inHead;
      /** @type {boolean|undefined} */

      let inDelimiterRow;
      /** @type {boolean|undefined} */

      let inRow;
      /** @type {number|undefined} */

      let contentStart;
      /** @type {number|undefined} */

      let contentEnd;
      /** @type {number|undefined} */

      let cellStart;
      /** @type {boolean|undefined} */

      let seenCellInRow;

      while (++index < events.length) {
        const token = events[index][1];

        if (inRow) {
          if (token.type === 'temporaryTableCellContent') {
            contentStart = contentStart || index;
            contentEnd = index;
          }

          if (
            // Combine separate content parts into one.
            (token.type === 'tableCellDivider' || token.type === 'tableRow') &&
            contentEnd
          ) {
            const content = {
              type: 'tableContent',
              start: events[contentStart][1].start,
              end: events[contentEnd][1].end
            };
            /** @type {Token} */

            const text = {
              type: 'chunkText',
              start: content.start,
              end: content.end,
              // @ts-expect-error It’s fine.
              contentType: 'text'
            };
            events.splice(
              contentStart,
              contentEnd - contentStart + 1,
              ['enter', content, context],
              ['enter', text, context],
              ['exit', text, context],
              ['exit', content, context]
            );
            index -= contentEnd - contentStart - 3;
            contentStart = undefined;
            contentEnd = undefined;
          }
        }

        if (
          events[index][0] === 'exit' &&
          cellStart !== undefined &&
          cellStart + (seenCellInRow ? 0 : 1) < index &&
          (token.type === 'tableCellDivider' ||
            (token.type === 'tableRow' &&
              (cellStart + 3 < index ||
                events[cellStart][1].type !== 'whitespace')))
        ) {
          const cell = {
            type: inDelimiterRow
              ? 'tableDelimiter'
              : inHead
              ? 'tableHeader'
              : 'tableData',
            start: events[cellStart][1].start,
            end: events[index][1].end
          };
          events.splice(index + (token.type === 'tableCellDivider' ? 1 : 0), 0, [
            'exit',
            cell,
            context
          ]);
          events.splice(cellStart, 0, ['enter', cell, context]);
          index += 2;
          cellStart = index + 1;
          seenCellInRow = true;
        }

        if (token.type === 'tableRow') {
          inRow = events[index][0] === 'enter';

          if (inRow) {
            cellStart = index + 1;
            seenCellInRow = false;
          }
        }

        if (token.type === 'tableDelimiterRow') {
          inDelimiterRow = events[index][0] === 'enter';

          if (inDelimiterRow) {
            cellStart = index + 1;
            seenCellInRow = false;
          }
        }

        if (token.type === 'tableHead') {
          inHead = events[index][0] === 'enter';
        }
      }

      return events
    }
    /** @type {Tokenizer} */

    function tokenizeTable(effects, ok, nok) {
      const self = this;
      /** @type {Align[]} */

      const align = [];
      let tableHeaderCount = 0;
      /** @type {boolean|undefined} */

      let seenDelimiter;
      /** @type {boolean|undefined} */

      let hasDash;
      return start
      /** @type {State} */

      function start(code) {
        // @ts-expect-error Custom.
        effects.enter('table')._align = align;
        effects.enter('tableHead');
        effects.enter('tableRow'); // If we start with a pipe, we open a cell marker.

        if (code === 124) {
          return cellDividerHead(code)
        }

        tableHeaderCount++;
        effects.enter('temporaryTableCellContent'); // Can’t be space or eols at the start of a construct, so we’re in a cell.

        return inCellContentHead(code)
      }
      /** @type {State} */

      function cellDividerHead(code) {
        effects.enter('tableCellDivider');
        effects.consume(code);
        effects.exit('tableCellDivider');
        seenDelimiter = true;
        return cellBreakHead
      }
      /** @type {State} */

      function cellBreakHead(code) {
        if (code === null || markdownLineEnding(code)) {
          return atRowEndHead(code)
        }

        if (markdownSpace(code)) {
          effects.enter('whitespace');
          effects.consume(code);
          return inWhitespaceHead
        }

        if (seenDelimiter) {
          seenDelimiter = undefined;
          tableHeaderCount++;
        }

        if (code === 124) {
          return cellDividerHead(code)
        } // Anything else is cell content.

        effects.enter('temporaryTableCellContent');
        return inCellContentHead(code)
      }
      /** @type {State} */

      function inWhitespaceHead(code) {
        if (markdownSpace(code)) {
          effects.consume(code);
          return inWhitespaceHead
        }

        effects.exit('whitespace');
        return cellBreakHead(code)
      }
      /** @type {State} */

      function inCellContentHead(code) {
        // EOF, whitespace, pipe
        if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
          effects.exit('temporaryTableCellContent');
          return cellBreakHead(code)
        }

        effects.consume(code);
        return code === 92 ? inCellContentEscapeHead : inCellContentHead
      }
      /** @type {State} */

      function inCellContentEscapeHead(code) {
        if (code === 92 || code === 124) {
          effects.consume(code);
          return inCellContentHead
        } // Anything else.

        return inCellContentHead(code)
      }
      /** @type {State} */

      function atRowEndHead(code) {
        if (code === null) {
          return nok(code)
        }

        effects.exit('tableRow');
        effects.exit('tableHead');
        const originalInterrupt = self.interrupt;
        self.interrupt = true;
        return effects.attempt(
          {
            tokenize: tokenizeRowEnd,
            partial: true
          },
          function (code) {
            self.interrupt = originalInterrupt;
            effects.enter('tableDelimiterRow');
            return atDelimiterRowBreak(code)
          },
          function (code) {
            self.interrupt = originalInterrupt;
            return nok(code)
          }
        )(code)
      }
      /** @type {State} */

      function atDelimiterRowBreak(code) {
        if (code === null || markdownLineEnding(code)) {
          return rowEndDelimiter(code)
        }

        if (markdownSpace(code)) {
          effects.enter('whitespace');
          effects.consume(code);
          return inWhitespaceDelimiter
        }

        if (code === 45) {
          effects.enter('tableDelimiterFiller');
          effects.consume(code);
          hasDash = true;
          align.push(null);
          return inFillerDelimiter
        }

        if (code === 58) {
          effects.enter('tableDelimiterAlignment');
          effects.consume(code);
          effects.exit('tableDelimiterAlignment');
          align.push('left');
          return afterLeftAlignment
        } // If we start with a pipe, we open a cell marker.

        if (code === 124) {
          effects.enter('tableCellDivider');
          effects.consume(code);
          effects.exit('tableCellDivider');
          return atDelimiterRowBreak
        }

        return nok(code)
      }
      /** @type {State} */

      function inWhitespaceDelimiter(code) {
        if (markdownSpace(code)) {
          effects.consume(code);
          return inWhitespaceDelimiter
        }

        effects.exit('whitespace');
        return atDelimiterRowBreak(code)
      }
      /** @type {State} */

      function inFillerDelimiter(code) {
        if (code === 45) {
          effects.consume(code);
          return inFillerDelimiter
        }

        effects.exit('tableDelimiterFiller');

        if (code === 58) {
          effects.enter('tableDelimiterAlignment');
          effects.consume(code);
          effects.exit('tableDelimiterAlignment');
          align[align.length - 1] =
            align[align.length - 1] === 'left' ? 'center' : 'right';
          return afterRightAlignment
        }

        return atDelimiterRowBreak(code)
      }
      /** @type {State} */

      function afterLeftAlignment(code) {
        if (code === 45) {
          effects.enter('tableDelimiterFiller');
          effects.consume(code);
          hasDash = true;
          return inFillerDelimiter
        } // Anything else is not ok.

        return nok(code)
      }
      /** @type {State} */

      function afterRightAlignment(code) {
        if (code === null || markdownLineEnding(code)) {
          return rowEndDelimiter(code)
        }

        if (markdownSpace(code)) {
          effects.enter('whitespace');
          effects.consume(code);
          return inWhitespaceDelimiter
        } // `|`

        if (code === 124) {
          effects.enter('tableCellDivider');
          effects.consume(code);
          effects.exit('tableCellDivider');
          return atDelimiterRowBreak
        }

        return nok(code)
      }
      /** @type {State} */

      function rowEndDelimiter(code) {
        effects.exit('tableDelimiterRow'); // Exit if there was no dash at all, or if the header cell count is not the
        // delimiter cell count.

        if (!hasDash || tableHeaderCount !== align.length) {
          return nok(code)
        }

        if (code === null) {
          return tableClose(code)
        }

        return effects.check(
          nextPrefixedOrBlank,
          tableClose,
          effects.attempt(
            {
              tokenize: tokenizeRowEnd,
              partial: true
            },
            factorySpace(effects, bodyStart, 'linePrefix', 4),
            tableClose
          )
        )(code)
      }
      /** @type {State} */

      function tableClose(code) {
        effects.exit('table');
        return ok(code)
      }
      /** @type {State} */

      function bodyStart(code) {
        effects.enter('tableBody');
        return rowStartBody(code)
      }
      /** @type {State} */

      function rowStartBody(code) {
        effects.enter('tableRow'); // If we start with a pipe, we open a cell marker.

        if (code === 124) {
          return cellDividerBody(code)
        }

        effects.enter('temporaryTableCellContent'); // Can’t be space or eols at the start of a construct, so we’re in a cell.

        return inCellContentBody(code)
      }
      /** @type {State} */

      function cellDividerBody(code) {
        effects.enter('tableCellDivider');
        effects.consume(code);
        effects.exit('tableCellDivider');
        return cellBreakBody
      }
      /** @type {State} */

      function cellBreakBody(code) {
        if (code === null || markdownLineEnding(code)) {
          return atRowEndBody(code)
        }

        if (markdownSpace(code)) {
          effects.enter('whitespace');
          effects.consume(code);
          return inWhitespaceBody
        } // `|`

        if (code === 124) {
          return cellDividerBody(code)
        } // Anything else is cell content.

        effects.enter('temporaryTableCellContent');
        return inCellContentBody(code)
      }
      /** @type {State} */

      function inWhitespaceBody(code) {
        if (markdownSpace(code)) {
          effects.consume(code);
          return inWhitespaceBody
        }

        effects.exit('whitespace');
        return cellBreakBody(code)
      }
      /** @type {State} */

      function inCellContentBody(code) {
        // EOF, whitespace, pipe
        if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
          effects.exit('temporaryTableCellContent');
          return cellBreakBody(code)
        }

        effects.consume(code);
        return code === 92 ? inCellContentEscapeBody : inCellContentBody
      }
      /** @type {State} */

      function inCellContentEscapeBody(code) {
        if (code === 92 || code === 124) {
          effects.consume(code);
          return inCellContentBody
        } // Anything else.

        return inCellContentBody(code)
      }
      /** @type {State} */

      function atRowEndBody(code) {
        effects.exit('tableRow');

        if (code === null) {
          return tableBodyClose(code)
        }

        return effects.check(
          nextPrefixedOrBlank,
          tableBodyClose,
          effects.attempt(
            {
              tokenize: tokenizeRowEnd,
              partial: true
            },
            factorySpace(effects, rowStartBody, 'linePrefix', 4),
            tableBodyClose
          )
        )(code)
      }
      /** @type {State} */

      function tableBodyClose(code) {
        effects.exit('tableBody');
        return tableClose(code)
      }
      /** @type {Tokenizer} */

      function tokenizeRowEnd(effects, ok, nok) {
        return start
        /** @type {State} */

        function start(code) {
          effects.enter('lineEnding');
          effects.consume(code);
          effects.exit('lineEnding');
          return factorySpace(effects, prefixed, 'linePrefix')
        }
        /** @type {State} */

        function prefixed(code) {
          // Blank or interrupting line.
          if (
            self.parser.lazy[self.now().line] ||
            code === null ||
            markdownLineEnding(code)
          ) {
            return nok(code)
          }

          const tail = self.events[self.events.length - 1]; // Indented code can interrupt delimiter and body rows.

          if (
            !self.parser.constructs.disable.null.includes('codeIndented') &&
            tail &&
            tail[1].type === 'linePrefix' &&
            tail[2].sliceSerialize(tail[1], true).length >= 4
          ) {
            return nok(code)
          }

          self._gfmTableDynamicInterruptHack = true;
          return effects.check(
            self.parser.constructs.flow,
            function (code) {
              self._gfmTableDynamicInterruptHack = false;
              return nok(code)
            },
            function (code) {
              self._gfmTableDynamicInterruptHack = false;
              return ok(code)
            }
          )(code)
        }
      }
    }
    /** @type {Tokenizer} */

    function tokenizeNextPrefixedOrBlank(effects, ok, nok) {
      let size = 0;
      return start
      /** @type {State} */

      function start(code) {
        // This is a check, so we don’t care about tokens, but we open a bogus one
        // so we’re valid.
        effects.enter('check'); // EOL.

        effects.consume(code);
        return whitespace
      }
      /** @type {State} */

      function whitespace(code) {
        if (code === -1 || code === 32) {
          effects.consume(code);
          size++;
          return size === 4 ? ok : whitespace
        } // EOF or whitespace

        if (code === null || markdownLineEndingOrSpace(code)) {
          return ok(code)
        } // Anything else.

        return nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     * @typedef {import('micromark-util-types').Token} Token
     * @typedef {import('micromark-util-types').CompileContext} CompileContext
     */

    /**
     * An opening or closing tag, followed by a case-insensitive specific tag name,
     * followed by HTML whitespace, a greater than, or a slash.
     */
    const reFlow =
      /<(\/?)(iframe|noembed|noframes|plaintext|script|style|title|textarea|xmp)(?=[\t\n\f\r />])/gi;

    /**
     * As HTML (text) parses tags separately (and v. strictly), we don’t need to be
     * global.
     */
    const reText = new RegExp('^' + reFlow.source, 'i');

    /** @type {HtmlExtension} */
    const gfmTagfilterHtml = {
      exit: {
        htmlFlowData(token) {
          exitHtmlData.call(this, token, reFlow);
        },
        htmlTextData(token) {
          exitHtmlData.call(this, token, reText);
        }
      }
    };

    /**
     * @this {CompileContext}
     * @param {Token} token
     * @param {RegExp} filter
     */
    function exitHtmlData(token, filter) {
      let value = this.sliceSerialize(token);

      if (this.options.allowDangerousHtml) {
        value = value.replace(filter, '&lt;$1$2');
      }

      this.raw(this.encode(value));
    }

    /**
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     */

    /** @type {HtmlExtension} */
    const gfmTaskListItemHtml = {
      enter: {
        taskListCheck() {
          this.tag('<input ');
        }
      },
      exit: {
        taskListCheck() {
          this.tag('disabled="" type="checkbox">');
        },

        taskListCheckValueChecked() {
          this.tag('checked="" ');
        }
      }
    };

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').ConstructRecord} ConstructRecord
     * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
     * @typedef {import('micromark-util-types').Previous} Previous
     * @typedef {import('micromark-util-types').State} State
     * @typedef {import('micromark-util-types').Event} Event
     * @typedef {import('micromark-util-types').Code} Code
     */
    const tasklistCheck = {
      tokenize: tokenizeTasklistCheck
    };
    const gfmTaskListItem = {
      text: {
        [91]: tasklistCheck
      }
    };
    /** @type {Tokenizer} */

    function tokenizeTasklistCheck(effects, ok, nok) {
      const self = this;
      return open
      /** @type {State} */

      function open(code) {
        if (
          // Exit if there’s stuff before.
          self.previous !== null || // Exit if not in the first content that is the first child of a list
          // item.
          !self._gfmTasklistFirstContentOfListItem
        ) {
          return nok(code)
        }

        effects.enter('taskListCheck');
        effects.enter('taskListCheckMarker');
        effects.consume(code);
        effects.exit('taskListCheckMarker');
        return inside
      }
      /** @type {State} */

      function inside(code) {
        if (markdownSpace(code)) {
          effects.enter('taskListCheckValueUnchecked');
          effects.consume(code);
          effects.exit('taskListCheckValueUnchecked');
          return close
        }

        if (code === 88 || code === 120) {
          effects.enter('taskListCheckValueChecked');
          effects.consume(code);
          effects.exit('taskListCheckValueChecked');
          return close
        }

        return nok(code)
      }
      /** @type {State} */

      function close(code) {
        if (code === 93) {
          effects.enter('taskListCheckMarker');
          effects.consume(code);
          effects.exit('taskListCheckMarker');
          effects.exit('taskListCheck');
          return effects.check(
            {
              tokenize: spaceThenNonSpace
            },
            ok,
            nok
          )
        }

        return nok(code)
      }
    }
    /** @type {Tokenizer} */

    function spaceThenNonSpace(effects, ok, nok) {
      const self = this;
      return factorySpace(effects, after, 'whitespace')
      /** @type {State} */

      function after(code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
          tail[1].type === 'whitespace' &&
          code !== null &&
          !markdownLineEndingOrSpace(code)
          ? ok(code)
          : nok(code)
      }
    }

    /**
     * @typedef {import('micromark-util-types').Extension} Extension
     * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
     * @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
     * @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
     */

    /**
     * Support GFM or markdown on github.com.
     *
     * @param {Options} [options]
     * @returns {Extension}
     */
    function gfm(options) {
      return combineExtensions([
        gfmAutolinkLiteral,
        gfmFootnote(),
        gfmStrikethrough(options),
        gfmTable,
        gfmTaskListItem
      ])
    }

    /**
     * Support to compile GFM to HTML.
     *
     * @param {HtmlOptions} [options]
     * @returns {HtmlExtension}
     */
    function gfmHtml(options) {
      return combineHtmlExtensions([
        gfmAutolinkLiteralHtml,
        gfmFootnoteHtml(options),
        gfmStrikethroughHtml,
        gfmTableHtml,
        gfmTagfilterHtml,
        gfmTaskListItemHtml
      ])
    }

    function sanitizeHtml(text) {
        var sanitized = text.replace('&', '&amp;')
                        .replace('<', '&lt;')
                        .replace('>', '&gt;')
                        .replace('"', '&quot;')
                        .replace("'", '&#39;');

        return sanitized;
    }

    function markdown(text) {
        return  micromark(
            sanitizeHtml(text), {
                extensions: [gfm()],
                htmlExtensions: [gfmHtml()]
            }
        )
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\Note.svelte generated by Svelte v3.44.1 */
    const file$3 = "src\\Note.svelte";

    function create_fragment$3(ctx) {
    	let ul;
    	let li0;
    	let svg0;
    	let path0;
    	let t0;
    	let li1;
    	let svg1;
    	let path1;
    	let t1;
    	let div1;
    	let div0;
    	let raw_value = markdown(/*content*/ ctx[0]) + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ul = element$1("ul");
    			li0 = element$1("li");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			li1 = element$1("li");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			div1 = element$1("div");
    			div0 = element$1("div");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z");
    			add_location(path0, file$3, 103, 192, 3055);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "data-prefix", "fas");
    			attr_dev(svg0, "data-icon", "edit");
    			attr_dev(svg0, "class", "svg-inline--fa fa-edit fa-w-18 svelte-itzfci");
    			attr_dev(svg0, "role", "img");
    			attr_dev(svg0, "viewBox", "0 0 576 512");
    			add_location(svg0, file$3, 103, 8, 2871);
    			attr_dev(li0, "class", "toolbar-item svelte-itzfci");
    			attr_dev(li0, "title", "Edit Note");
    			add_location(li0, file$3, 102, 4, 2794);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z");
    			add_location(path1, file$3, 106, 194, 3885);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "data-prefix", "fas");
    			attr_dev(svg1, "data-icon", "trash");
    			attr_dev(svg1, "class", "svg-inline--fa fa-trash fa-w-14 svelte-itzfci");
    			attr_dev(svg1, "role", "img");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			add_location(svg1, file$3, 106, 8, 3699);
    			attr_dev(li1, "class", "toolbar-item svelte-itzfci");
    			attr_dev(li1, "title", "Delete this Note");
    			add_location(li1, file$3, 105, 4, 3617);
    			attr_dev(ul, "class", "toolbar svelte-itzfci");
    			add_location(ul, file$3, 101, 0, 2768);
    			attr_dev(div0, "class", "content svelte-itzfci");
    			add_location(div0, file$3, 110, 4, 4201);
    			attr_dev(div1, "class", "body svelte-itzfci");
    			add_location(div1, file$3, 109, 0, 4177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, svg0);
    			append_dev(svg0, path0);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, svg1);
    			append_dev(svg1, path1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*openInEditor*/ ctx[2], false, false, false),
    					listen_dev(li1, "click", /*deleteSelf*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1 && raw_value !== (raw_value = markdown(/*content*/ ctx[0]) + "")) div0.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $appState;
    	validate_store(appState, 'appState');
    	component_subscribe($$self, appState, $$value => $$invalidate(4, $appState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Note', slots, []);
    	let { content } = $$props;
    	let { index } = $$props;
    	var deleteSelf = () => deleteNote(index);

    	function openInEditor() {
    		set_store_value(appState, $appState.editNoteIndex = index, $appState);
    		set_store_value(appState, $appState.editorOpen = true, $appState);
    	}

    	const writable_props = ['content', 'index'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Note> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		deleteNote,
    		appState,
    		markdown,
    		fade,
    		content,
    		index,
    		deleteSelf,
    		openInEditor,
    		$appState
    	});

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    		if ('deleteSelf' in $$props) $$invalidate(1, deleteSelf = $$props.deleteSelf);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, deleteSelf, openInEditor, index];
    }

    class Note extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { content: 0, index: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Note",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !('content' in props)) {
    			console.warn("<Note> was created without expected prop 'content'");
    		}

    		if (/*index*/ ctx[3] === undefined && !('index' in props)) {
    			console.warn("<Note> was created without expected prop 'index'");
    		}
    	}

    	get content() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Note>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Note>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NoteEditor.svelte generated by Svelte v3.44.1 */
    const file$2 = "src\\NoteEditor.svelte";

    // (178:4) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element$1("button");
    			button.textContent = "Edit Note";
    			attr_dev(button, "class", "action svelte-cd9i08");
    			add_location(button, file$2, 178, 8, 4922);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*finishEdit*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(178:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (176:4) {#if !edit}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element$1("button");
    			button.textContent = "Add Note";
    			attr_dev(button, "class", "action svelte-cd9i08");
    			add_location(button, file$2, 176, 8, 4841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*submit*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(176:4) {#if !edit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let article;
    	let ul;
    	let t0;
    	let div;
    	let textarea;
    	let t1;
    	let section_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*edit*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element$1("section");
    			article = element$1("article");
    			ul = element$1("ul");
    			t0 = space();
    			div = element$1("div");
    			textarea = element$1("textarea");
    			t1 = space();
    			if_block.c();
    			attr_dev(ul, "class", "toolbar svelte-cd9i08");
    			add_location(ul, file$2, 168, 8, 4600);
    			attr_dev(textarea, "id", "note-text");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Put some text (or markdown) here");
    			attr_dev(textarea, "class", "svelte-cd9i08");
    			add_location(textarea, file$2, 171, 12, 4677);
    			attr_dev(div, "class", "body svelte-cd9i08");
    			add_location(div, file$2, 170, 8, 4645);
    			attr_dev(article, "class", "note svelte-cd9i08");
    			add_location(article, file$2, 167, 4, 4568);
    			attr_dev(section, "class", "note-editor-container svelte-cd9i08");
    			add_location(section, file$2, 163, 0, 4444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, article);
    			append_dev(article, ul);
    			append_dev(article, t0);
    			append_dev(article, div);
    			append_dev(div, textarea);
    			append_dev(section, t1);
    			if_block.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(section, "click", /*backgroundClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { duration: 100 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { duration: 100 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			if (detaching && section_transition) section_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $appState;
    	validate_store(appState, 'appState');
    	component_subscribe($$self, appState, $$value => $$invalidate(4, $appState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NoteEditor', slots, []);
    	var edit = false;

    	onMount(async () => {
    		if ($appState.editNoteIndex !== undefined) {
    			var textbox = document.getElementById("note-text");
    			var note = getEditNote();
    			textbox.value = note.content;
    			$$invalidate(0, edit = true);
    		}
    	});

    	function finishEdit() {
    		var textbox = document.getElementById("note-text");
    		if (!textbox.value) return;
    		editNote({ content: textbox.value });
    		set_store_value(appState, $appState.editNoteIndex = undefined, $appState);
    		closeEditor();
    	}

    	var backgroundClick = e => e.target == e.currentTarget ? closeEditor() : undefined;
    	var closeEditor = () => set_store_value(appState, $appState.editorOpen = false, $appState);

    	function submit() {
    		var textbox = document.getElementById("note-text");
    		if (!textbox.value) return;
    		addNote({ content: textbox.value });
    		closeEditor();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NoteEditor> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		addNote,
    		appState,
    		getEditNote,
    		editNote,
    		onMount,
    		fade,
    		edit,
    		finishEdit,
    		backgroundClick,
    		closeEditor,
    		submit,
    		$appState
    	});

    	$$self.$inject_state = $$props => {
    		if ('edit' in $$props) $$invalidate(0, edit = $$props.edit);
    		if ('backgroundClick' in $$props) $$invalidate(2, backgroundClick = $$props.backgroundClick);
    		if ('closeEditor' in $$props) closeEditor = $$props.closeEditor;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [edit, finishEdit, backgroundClick, submit];
    }

    class NoteEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoteEditor",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Menu.svelte generated by Svelte v3.44.1 */
    const file$1 = "src\\Menu.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let button0;
    	let svg0;
    	let path0;
    	let t;
    	let li1;
    	let button1;
    	let svg1;
    	let path1;
    	let ul_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element$1("nav");
    			ul = element$1("ul");
    			li0 = element$1("li");
    			button0 = element$1("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t = space();
    			li1 = element$1("li");
    			button1 = element$1("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z");
    			add_location(path0, file$1, 92, 198, 2653);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "data-prefix", "fas");
    			attr_dev(svg0, "data-icon", "cog");
    			attr_dev(svg0, "class", "svg-inline--fa fa-cog fa-w-16 svelte-11dimfe");
    			attr_dev(svg0, "role", "img");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			add_location(svg0, file$1, 92, 16, 2471);
    			attr_dev(button0, "title", "Options");
    			attr_dev(button0, "class", "svelte-11dimfe");
    			add_location(button0, file$1, 91, 12, 2429);
    			attr_dev(li0, "class", "nav-element svelte-11dimfe");
    			add_location(li0, file$1, 90, 8, 2391);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z");
    			add_location(path1, file$1, 97, 200, 3836);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "data-prefix", "fas");
    			attr_dev(svg1, "data-icon", "plus");
    			attr_dev(svg1, "class", "svg-inline--fa fa-plus fa-w-14 svelte-11dimfe");
    			attr_dev(svg1, "role", "img");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			add_location(svg1, file$1, 97, 16, 3652);
    			attr_dev(button1, "title", "Add Note");
    			attr_dev(button1, "class", "svelte-11dimfe");
    			add_location(button1, file$1, 96, 12, 3609);
    			attr_dev(li1, "class", "nav-element svelte-11dimfe");
    			add_location(li1, file$1, 95, 8, 3549);
    			attr_dev(ul, "class", "nav-list svelte-11dimfe");
    			add_location(ul, file$1, 89, 4, 2333);
    			attr_dev(nav, "class", "svelte-11dimfe");
    			add_location(nav, file$1, 88, 0, 2322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(ul, t);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li1, "click", /*openEditor*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, fly, { x: 200 }, true);
    				ul_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ul_transition) ul_transition = create_bidirectional_transition(ul, fly, { x: 200 }, false);
    			ul_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching && ul_transition) ul_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $appState;
    	validate_store(appState, 'appState');
    	component_subscribe($$self, appState, $$value => $$invalidate(1, $appState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	var openEditor = () => set_store_value(appState, $appState.editorOpen = true, $appState);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ appState, fly, openEditor, $appState });

    	$$self.$inject_state = $$props => {
    		if ('openEditor' in $$props) $$invalidate(0, openEditor = $$props.openEditor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openEditor];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (84:8) {#each $notes as note, index (note.id)}
    function create_each_block(key_1, ctx) {
    	let article;
    	let note;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	const note_spread_levels = [/*note*/ ctx[2], { index: /*index*/ ctx[4] }];
    	let note_props = {};

    	for (let i = 0; i < note_spread_levels.length; i += 1) {
    		note_props = assign(note_props, note_spread_levels[i]);
    	}

    	note = new Note({ props: note_props, $$inline: true });

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			article = element$1("article");
    			create_component(note.$$.fragment);
    			attr_dev(article, "class", "note svelte-49ujc2");
    			add_location(article, file, 84, 12, 2123);
    			this.first = article;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			mount_component(note, article, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const note_changes = (dirty & /*$notes*/ 1)
    			? get_spread_update(note_spread_levels, [get_spread_object(/*note*/ ctx[2]), { index: /*index*/ ctx[4] }])
    			: {};

    			note.$set(note_changes);
    		},
    		r: function measure() {
    			rect = article.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(article);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(article, rect, flip, { duration: 250 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(note.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(note.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_component(note);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:8) {#each $notes as note, index (note.id)}",
    		ctx
    	});

    	return block;
    }

    // (89:8) {#if !$notes.length}
    function create_if_block_1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element$1("h1");
    			h1.textContent = "Click on the + to create a note";
    			attr_dev(h1, "class", "no-notes svelte-49ujc2");
    			add_location(h1, file, 89, 12, 2306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(89:8) {#if !$notes.length}",
    		ctx
    	});

    	return block;
    }

    // (97:0) {:else}
    function create_else_block(ctx) {
    	let menu;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(97:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (95:0) {#if $appState.editorOpen}
    function create_if_block(ctx) {
    	let noteeditor;
    	let current;
    	noteeditor = new NoteEditor({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(noteeditor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noteeditor, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noteeditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noteeditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noteeditor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(95:0) {#if $appState.editorOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let main;
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let each_value = /*$notes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*note*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block0 = !/*$notes*/ ctx[0].length && create_if_block_1(ctx);
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$appState*/ ctx[1].editorOpen) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			header = element$1("header");
    			h1 = element$1("h1");
    			h1.textContent = "Notes";
    			t1 = space();
    			main = element$1("main");
    			section = element$1("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(h1, "class", "svelte-49ujc2");
    			add_location(h1, file, 76, 4, 1980);
    			attr_dev(header, "class", "svelte-49ujc2");
    			add_location(header, file, 75, 0, 1966);
    			attr_dev(section, "class", "notes svelte-49ujc2");
    			add_location(section, file, 82, 4, 2037);
    			add_location(main, file, 81, 0, 2025);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(section, t2);
    			if (if_block0) if_block0.m(section, null);
    			insert_dev(target, t3, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$notes*/ 1) {
    				each_value = /*$notes*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, fix_and_outro_and_destroy_block, create_each_block, t2, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (!/*$notes*/ ctx[0].length) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(section, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t3);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $notes;
    	let $appState;
    	validate_store(notes, 'notes');
    	component_subscribe($$self, notes, $$value => $$invalidate(0, $notes = $$value));
    	validate_store(appState, 'appState');
    	component_subscribe($$self, appState, $$value => $$invalidate(1, $appState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Note,
    		NoteEditor,
    		Menu,
    		notes,
    		appState,
    		flip,
    		$notes,
    		$appState
    	});

    	return [$notes, $appState];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
