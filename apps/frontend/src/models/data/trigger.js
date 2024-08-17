export class Trigger {
  constructor({ trigger_name, table_name }) {
    this.pm_trigger_name = trigger_name;
    this.pm_trigger_table_name = table_name;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Trigger(item);
      });
    }
  };
}
