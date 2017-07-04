'use strict';

const blessed = require('blessed');

function login_dialog(kube_config) {
  const form = blessed.form({
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

  form.on('keypress', (el, ch, key) => {
    if (ch.name === 'q') {
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
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 35,
    left         : 15,
    top          : 0,
    // FIXME: use the current config
    value        : kube_config[0].cluster.server
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
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 30,
    left         : 15,
    top          : 2,
    // FIXME: use the current config
    value        : kube_config[0].context.user.split('/')[0]
  });
  // retain key grabbing as text areas reset it after input reading
  username.on('blur', () => form.screen.grabKeys = true);

  blessed.text({
    parent  : form,
    mouse   : true,
    keys    : true,
    left    : 1,
    top     : 3,
    align   : 'left',
    content: 'Password    :'
  });

  const password = blessed.textbox({
    parent       : form,
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
    mouse   : true,
    keys    : true,
    left    : 1,
    top     : 4,
    align   : 'left',
    content : 'Token       :'
  }); 

  const token = blessed.textbox({
    parent       : form,
    inputOnFocus : true,
    mouse        : true,
    keys         : true,
    height       : 1,
    width        : 33,
    left         : 15,
    top          : 4,
    // FIXME: use the current config
    value        : kube_config[0].user.token
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

  return {
    form,
    username : () => username.value,
    password : () => password.value,
    token    : () => token.value,
    cluster  : () => cluster.value
  };
}

module.exports.dialog = login_dialog;