const blessed = require('blessed');

// Patches the default mouse wheel delta set to -/+ 2 in the List constuctor.
// It may be generalized to all List widgets by overriding the List constructor,
// like it's done for theming the options passed to the Node constructor.
const ListTable = blessed.listtable;
blessed.listtable = function (options) {
  const listTable = ListTable(options);

  listTable.removeAllListeners('element wheeldown');
  listTable.removeAllListeners('element wheelup');

  listTable.on('element wheeldown', function () {
    this.select(this.selected + 1);
    this.screen.render();
  });
  listTable.on('element wheelup', function () {
    this.select(this.selected - 1);
    this.screen.render();
  });

  return listTable;
}
