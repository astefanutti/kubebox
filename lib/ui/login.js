'use strict';

const blessed = require('blessed'),
      os      = require('os');

function login_form(kube_config, screen) {
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
      type : 'line'
    }
  });

  form.on('element keypress', (el, ch, key) => {
    if (key.name === 'enter') {
      form.submit();
    }
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
    content : 'Cluster URL :'
  }); 

  const cluster = blessed.textbox({
    parent       : form,
    name         : 'cluster',
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 35,
    left         : 15,
    top          : 0,
    // FIXME: use the current config
    value        : kube_config.length ? kube_config[0].cluster.server : ''
  });
  // retain key grabbing as text areas reset it after input reading
  cluster.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 2,
    align   : 'left',
    content : 'Username    :'
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
    // FIXME: use the current config
    value        : kube_config.length ? kube_config[0].context.user.split('/')[0] : ''
  });
  // retain key grabbing as text areas reset it after input reading
  username.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 3,
    align   : 'left',
    content: 'Password    :'
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
    top          : 3
  });
  // retain key grabbing as text areas reset it after input reading
  password.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    left    : 1,
    top     : 4,
    align   : 'left',
    content : 'Token       :'
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
    // FIXME: use the current config
    value        : kube_config.length ? kube_config[0].user.token : ''
  });
  // retain key grabbing as text areas reset it after input reading
  token.on('blur', () => form.screen.grabKeys = true);

  const login = blessed.button({
    parent  : form,
    mouse   : true,
    keys    : true,
    shrink  : true,
    padding : {
      left  : 1,
      right : 1
    },
    left    : 40,
    top     : 6,
    content : 'Log In',
    style   : {
      focus : {
        bg  : 'grey'
      }
    }
  });
  login.on('press', () => form.submit());

  // Reset the focus stack when clicking on a form element
  function focusOnclick(element){
    element.on('click', function(data) {
      form._selected = element;
    });
  }

  focusOnclick(username);
  focusOnclick(password);
  focusOnclick(token);
  focusOnclick(cluster);
  
  // This is a hack to not 'rewind' the focus stack on 'blur'
  username.options.inputOnFocus = false;
  password.options.inputOnFocus = false;
  token.options.inputOnFocus    = false;
  cluster.options.inputOnFocus  = false;

  return {
    form,
    username : () => username.value,
    password : () => password.value,
    token    : () => token.value,
    cluster  : () => cluster.value
  };
}

function prompt(screen, kube_config) {
  return new Promise(function(fulfill, reject) {
    screen.saveFocus();
    screen.grabKeys = true;
    const { form, username, password, token, cluster } = login_form(kube_config, screen);
    screen.append(form);
    form.focusNext();
    screen.render();
    // TODO: enable cancelling when already logged
    form.on('submit', data => {
      screen.remove(form);
      screen.restoreFocus();
      screen.grabKeys = false;
      screen.render();
      fulfill({
        cluster  : cluster(),
        username : username(),
        password : password(),
        token    : token()
      });
    });
  });
}

module.exports.prompt = prompt;