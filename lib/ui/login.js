'use strict';

const blessed = require('blessed'),
      os      = require('os');

const { safeGet } = require('../util');

function login_form(screen, kube_config, kubebox, { closable } = { closable: false }) {
  const form = blessed.form({
    name      : 'form',
    screen    : screen,
    keys      : true,
    clickable : true,
    left      : 'center',
    top       : 'center',
    width     : 53,
    height    : kube_config ? 9 : 7,
    shrink    : false,
    border    : 'line',
  });
  // retain key grabbing as text areas reset it after input reading / blurring
  form.on('focus', () => form.screen.grabKeys = true);

  form.on('element keypress', (el, ch, key) => {
    // submit the form on enter for textboxes
    if (key.name === 'enter' && el.type === 'textbox') {
      form.submit();
    }
  });

  form.on('keypress', (ch, key) => {
    switch(key.full) {
      case 'left':
        if (kube_config) {
          kube_config.previousContext();
          refresh();
        }
        break;
      case 'right':
        if (kube_config) {
          kube_config.nextContext();
          refresh();
        }
        break;
      case 'enter':
        form.submit();
        break;
      case 'escape':
        if (closable) form.cancel();
    }
  });

  form.on('key q', () => {
    if (os.platform() !== 'browser') {
      process.exit(0);
    }
  });

  blessed.text({
    // hide the URL input when a server URL is already provided
    hidden  : !kube_config,
    parent  : form,
    left    : 2,
    bottom  : 7,
    align   : 'left',
    content : 'Cluster URL :',
  });

  const url = blessed.textbox({
    // hide the URL input when a server URL is already provided
    hidden       : !kube_config,
    parent       : form,
    name         : 'url',
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 35,
    left         : 16,
    bottom       : 7,
  });

  blessed.text({
    parent  : form,
    left    : 2,
    bottom  : 5,
    align   : 'left',
    content : 'Username    :',
  });

  const username = blessed.textbox({
    parent       : form,
    name         : 'username',
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 30,
    left         : 16,
    bottom       : 5,
  });

  blessed.text({
    parent  : form,
    left    : 2,
    bottom  : 4,
    align   : 'left',
    content: 'Password    :',
  });

  const password = blessed.textbox({
    parent       : form,
    name         : 'password',
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 30,
    left         : 16,
    censor       : true,
    bottom       : 4,
  });

  blessed.text({
    parent  : form,
    left    : 2,
    bottom  : 3,
    align   : 'left',
    content : 'Token       :',
  });

  const token = blessed.textbox({
    parent       : form,
    name         : 'token',
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 33,
    left         : 16,
    bottom       : 3,
  });

  if (os.platform() === 'browser' && kube_config) {
    const config = blessed.button({
      parent  : form,
      mouse   : true,
      keys    : true,
      shrink  : true,
      padding : {
        left  : 1,
        right : 1,
      },
      left    : 2,
      bottom  : 1,
      content : 'Import...',
      style   : {
        focus : {
          bg : 'grey',
        },
        hover : {
          bg : 'grey',
        },
      },
    });
    config.on('press', () => kubebox.emit('kubeConfigImport'));
  }

  if (closable) {
    const cancel = blessed.button({
      parent  : form,
      mouse   : true,
      keys    : true,
      shrink  : true,
      padding : {
        left  : 1,
        right : 1,
      },
      right   : 11,
      bottom  : 1,
      content : 'Cancel',
      style   : {
        focus : {
          bg : 'grey',
        },
        hover : {
          bg : 'grey',
        },
      },
    });
    cancel.on('press', () => form.cancel());
  }

  const login = blessed.button({
    parent  : form,
    mouse   : true,
    keys    : true,
    shrink  : true,
    padding : {
      left  : 1,
      right : 1,
    },
    right   : 2,
    bottom  : 1,
    content : 'Log In',
    style   : {
      focus : {
        bg : 'grey',
      },
      hover : {
        bg : 'grey',
      },
    },
  });
  login.on('press', () => form.submit());

  // Reset the focus stack when clicking on a form element
  const focusOnclick = element => element.on('click', () => form._selected = element);

  focusOnclick(username);
  focusOnclick(password);
  focusOnclick(token);
  focusOnclick(url);

  // This is a hack to not 'rewind' the focus stack on 'blur'
  username.options.inputOnFocus = false;
  password.options.inputOnFocus = false;
  token.options.inputOnFocus = false;
  url.options.inputOnFocus = false;

  const refresh = function () {
    // If no current context, let's try the first one if any
    if (kube_config && !kube_config.current_context) kube_config.nextContext();

    url.value = safeGet(kube_config, 'current_context', 'cluster.server') || '';
    const user = safeGet(kube_config, 'current_context', 'user') || {};
    username.value = user.username || '';
    token.value = user.token || '';
    password.value = user.password || '';
    if (user.auth_provider && user.auth_provider.token) {
      token.value = user.auth_provider.token;
    }
    form.screen.render();
  }

  refresh();

  return {
    form, refresh,
    username : () => username.value,
    password : () => password.value,
    token    : () => token.value,
    url      : () => url.value,
  };
}

function prompt(screen, kube_config, kubebox, { closable, message }) {
  let cancellation = Function.prototype;
  const promise = new Promise(function (fulfill, reject) {
    screen.saveFocus();
    screen.grabKeys = true;
    screen.grabMouse = true;

    const { form, refresh, username, password, token, url } = login_form(screen, kube_config, kubebox, { closable });

    function kubeConfigChange() {
      form.resetSelected();
      form.focus();
      refresh();
    };
    if (kube_config) kube_config.on('kubeConfigChange', kubeConfigChange);

    let closed = false;
    function close_login_form() {
      closed = true;
      if (kube_config) kube_config.removeListener('kubeConfigChange', kubeConfigChange);
      // work around form 'element keypress' event handler that focus the form on ESC
      form.focus = () => {};
      form.destroy();
      screen.restoreFocus();
      screen.grabKeys = false;
      screen.grabMouse = false;
      screen.render();
    }
    cancellation = () => {
      if (!closed) close_login_form();
    };

    let text;
    function display_message(message) {
      let dy = 0;
      if (text) {
        dy = text.lpos.yl - text.lpos.yi + 1;
        text.setContent(message);
      } else {
        text = blessed.text({
          parent  : form,
          tags    : true,
          left    : 2,
          right   : 2,
          top     : 1,
          align   : 'left',
          height  : 'shrink',
          content : message,
        });
      }
      text.render();
      form.height += text.lpos.yl - text.lpos.yi + 1 - dy;
      screen.render();
    }

    form.on('submit', _ => {
      // we may want to provide URL validation
      if (kube_config && !url()) {
        display_message('{red-fg}URL is not valid!{/red-fg}');
        return;
      }
      close_login_form();
      fulfill({
        url      : url(),
        username : username(),
        password : password(),
        token    : token(),
      });
    });

    form.on('cancel', () => close_login_form());

    screen.append(form);
    form.focus();
    form.grabMouse = true;
    screen.render();

    if (message) {
      display_message(message);
    }
  });
  return { promise, cancellation: () => cancellation() };
}

module.exports.prompt = prompt;
