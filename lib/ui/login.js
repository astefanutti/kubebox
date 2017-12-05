'use strict';

const blessed = require('blessed'),
      os      = require('os');

function login_form(kube_config, screen, kubebox) {
  const form = blessed.form({
    parent : screen,
    name   : 'form',
    keys   : true,
    mouse  : true,
    vi     : true,
    left   : 'center',
    top    : 'center',
    width  : 53,
    height : 10,
    shrink : 'never',
    border : {
      type : 'line',
    }
  });

  form.on('element keypress', (el, ch, key) => {
    // submit the form on enter for textboxes
    if (key.name === 'enter' && el.type === 'textbox') {
      form.submit();
    }
  });

  form.on('keypress', (ch, key) => {
    switch(key.full) {
      case 'left':
        kube_config.previousContext();
        break;
      case 'right':
        kube_config.nextContext();
        break;
      default:
        return;
    }
    refresh();
  });

  form.on('key q', () => {
    if (os.platform() !== 'browser') {
      process.exit(0);
    }
  });

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 0,
    align   : 'left',
    content : 'Cluster URL :',
  }); 

  const url = blessed.textbox({
    parent       : form,
    name         : 'url',
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 35,
    left         : 15,
    top          : 0,
    value        : kube_config.current_context.cluster.server,
  });
  // retain key grabbing as text areas reset it after input reading
  url.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 2,
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
    left         : 15,
    top          : 2,
    value        : kube_config.current_context.user.username,
  });
  // retain key grabbing as text areas reset it after input reading
  username.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 3,
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
    left         : 15,
    censor       : true,
    top          : 3,
    value        : kube_config.current_context.user.password,
  });
  // retain key grabbing as text areas reset it after input reading
  password.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 4,
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
    left         : 15,
    top          : 4,
    value        : kube_config.current_context.user.token,
  });
  // retain key grabbing as text areas reset it after input reading
  token.on('blur', () => form.screen.grabKeys = true);

  if (os.platform() === 'browser') {
    const config = blessed.button({
      parent  : form,
      mouse   : true,
      keys    : true,
      shrink  : true,
      padding : {
        left  : 1,
        right : 1,
      },
      right   : 10,
      bottom  : 1,
      content : 'Import...',
      style   : {
        focus : {
          bg : 'grey',
        },
        hover : {
          bg : 'grey',
        }
      }
    });
    config.on('press', () => kubebox.emit('kubeConfigImport'));
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
    right   : 1,
    bottom  : 1,
    content : 'Log In',
    style   : {
      focus : {
        bg : 'grey',
      },
      hover : {
        bg : 'grey',
      }
    }
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
    url.value      = kube_config.current_context.cluster.server || '';
    username.value = kube_config.current_context.user.username || '';
    token.value    = kube_config.current_context.user.token || '';
    password.value = kube_config.current_context.user.password || '';
    form.screen.render();
  }

  return {
    form, refresh,
    username : () => username.value,
    password : () => password.value,
    token    : () => token.value,
    url      : () => url.value,
  };
}

function prompt(screen, kube_config, kubebox) {
  return new Promise(function (fulfill, reject) {
    screen.saveFocus();
    screen.grabKeys = true;
    const { form, refresh, username, password, token, url } = login_form(kube_config, screen, kubebox);
    const kubeConfigChange = function () {
      form.resetSelected();
      form.focus();
      refresh();
    };
    kube_config.on('kubeConfigChange', kubeConfigChange);
    screen.append(form);
    form.focus();
    screen.render();
    // TODO: enable cancelling when already logged
    form.on('submit', data => {
      kube_config.removeListener('kubeConfigChange', kubeConfigChange);
      screen.remove(form);
      screen.restoreFocus();
      screen.grabKeys = false;
      screen.render();
      fulfill({
        url      : url(),
        username : username(),
        password : password(),
        token    : token(),
      });
    });
  });
}

module.exports.prompt = prompt;