import {Api, Price} from "./api";
import {ChartList} from "./chart-list";

const api = new Api();
const charts = new ChartList(api);

//await api.login();
api.fake();


