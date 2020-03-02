export default class Page {
  open(path) {
    console.log('url:', path);
    browser.url(path);
  }
}
