import {Api} from "./api.ts";
import {ChartList} from "./chart-list.ts";

const api = new Api();
new ChartList(api);

await api.login();

