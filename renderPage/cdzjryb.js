// https://zw.cdzjryb.com/SCXX/Default.aspx?action=ucSCXXShowNew2
/**
 * 搜索参数
 *   地区
 *   开始时间
 *   结束时间
 * 查询
 *
 * 当前页码
 * 总页数
 * 确定
 */

const PageCfg = {
  // 地区
  area: {
    el: document.getElementById('ID_ucSCXXShowNew2_ddlRegion'),
    get() {
      return this.el.value;
    },
    set(val) {
      this.el.value = val;
    },
  },
  // 2022-06-16
  startDate: {
    el: document.getElementById('ID_ucSCXXShowNew2_txtTime1'),
    get() {
      return this.el.value;
    },
    set(val) {
      this.el.value = val;
    },
  },
  endDate: {
    el: document.getElementById('ID_ucSCXXShowNew2_txtTime2'),
    get() {
      return this.el.value;
    },
    set(val) {
      this.el.value = val;
    },
  },
  curPageNum: {
    el: document.querySelector('#ID_ucSCXXShowNew2_UcPager1_page1 .current'),
    get() {
      return this.el.textContent.trim();
    },
    set(val) {
      this.el.value = val;
    },
  },
  totalPageNum: {
    el: document.getElementById('ID_ucSCXXShowNew2_UcPager1_lbPageCount'),
    get() {
      return this.el.textContent.replace(/\D/g, '');
    },
  },
  getTableVal() {
    const handlerRow = (_tr, selector) => {
      const cols = Array.from(_tr.querySelectorAll(selector));
      return cols.map(item => item.textContent.trim());
    };
    const filterCb = row => row[4].includes('住宅');

    const table = document.querySelector('table#ID_ucSCXXShowNew2_gridView');
    const trs = Array.from(table.querySelectorAll('tr'));
    let rows = trs.map((row, rIdx) => handlerRow(row, rIdx ? 'td' : 'th'));
    const header = rows[0];
    const dataRow = rows.slice(1).filter(row => filterCb(row));
    return { header, dataRow };
  },
  // 修改搜索参数后刷新页面
  submitSearch: () => document.getElementById('ID_ucSCXXShowNew2_btnSccx').click(),
  prePage: () => document.getElementById('ID_ucSCXXShowNew2_UcPager1_btnNewLast').click(),
  nextPage: () => document.getElementById('ID_ucSCXXShowNew2_UcPager1_btnNewNext').click(),
};

// setup
// const wishSearchVal = {
//   area: '双流区',
//   startDate: '2022-05-16',
//   endDate: '2022-08-16',
// };

// wishSearchVal: 期望的搜索参数
const parsePage = async (wishSearchVal) => {
  const { Log, Storage, saveFile, getNow } = await import('./util.js');

  // 更新筛选参数
  // const TargetSearch = Storage.get('TargetSearch', 'local');
  const pageInfo = {};
  pageInfo.title = document.title;
  pageInfo.parseTime = getNow();
  Object.keys(PageCfg).forEach(k => {
    if (typeof PageCfg[k].get === 'function') {
      pageInfo[k] = PageCfg[k].get();
    }
  });
  const isTargetSearchVa = Object.keys(wishSearchVal).every(k => wishSearchVal[k] === pageInfo[k]);
  if (!isTargetSearchVa) {
    Object.keys(wishSearchVal).forEach(k => {
      PageCfg[k].set(wishSearchVal[k]);
    });
    // 刷新页面
    PageCfg.submitSearch();
    return;
  }
  // Log('pageInfo\n', pageInfo);

  // 解析表格
  const tableInfo = PageCfg.getTableVal(); // { header, dataRow: [[col], [col]] }
  Log(`数据行: ${tableInfo.dataRow.length - 1}`);
  return { pageInfo, tableInfo };
};

// init
(async () => {
  const { Log } = await import('./util.js');

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    Log('收到消息\n', request, '\n sender\n', sender);
    // 来自popup
    if (sender.id === 'dmpmcohcnfkhemdccjefninlcelpbpnl') {
      if (request.type === 'GetPageInfo') {
        const result = await parsePage(request.data);
        sendMeg(result);
        // sendResponse(data)
      }
      return;
    }
  });
})();

const sendMeg = (json) => {
  chrome.runtime.sendMessage(json, res => {
    Log('sendMeg() cb res:', res);
  });
}

// chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
//   console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
//   if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' });
//   else sendResponse({}); // snub them.
// });
