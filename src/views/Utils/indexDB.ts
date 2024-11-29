export default class IndexedDB {
  private dbName: string;
  private db: IDBDatabase | null = null; // 数据库实例

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  /**
   * 打开数据库 参数：对象仓库名称、主键、索引数组（可选）
   * 第一个参数，索引的名称。
   * 第二个参数，指定根据存储数据的哪一个属性来构建索引。
   * 第三个属性， options对象，其中属性unique的值为true表示不允许索引值相等。
   * const airbnDB = new IndexedDB('airbnDB')
   * airbnDB.openStore('room','id', ['hose', 'shu'])
   */
  openStore(storeName: string, keyPath: string, indexs?: Array<string>) {
    let request = window.indexedDB.open(this.dbName, 2); // 名称 版本号（不可回退）

    // 数据库打开成功的回调
    request.onsuccess = (e: Event) => {
      console.log("数据库打开成功");
      console.log(e);

      // 赋值数据库实例
      this.db = (e.target as IDBOpenDBRequest).result;
    };

    // 数据库打开失败的回调
    request.onerror = function (e) {
      console.log("数据库打开失败");
      console.log(e);
    };

    // 数据库更新成功的回调
    request.onupgradeneeded = function (e: IDBVersionChangeEvent) {
      console.log("数据库更新成功");
      const { result } = e.target as IDBOpenDBRequest;

      // 创建对象仓库（传入仓库名和主键名，主键设置为递增）
      const store = result.createObjectStore(storeName, {
        autoIncrement: true,
        keyPath,
      });

      // 创建该对象仓库属性的索引
      if (indexs && indexs.length > 0) {
        indexs.map(function (i: string) {
          store.createIndex(i, i, { unique: true });
        });
      }

      // 对象仓库创建成功的回调
      store.transaction.oncomplete = function (e) {
        console.log("对象仓库创建成功");
        console.log(e);
      };
    };
  }

  /**
   * 新增、修改对象仓库数据  参数：仓库名、数据
   * 增加属性
   * airbnDB.updateItem(storeName, {name: 'cocoon', age: 18})
   * 修改属性（通过主键修改）
   * airbnDB.updateItem(storeName, {id: 1, name: 'czy', age: 21})
   */
  updateItem(storeName: string, data: any) {
    // 打开对象仓库
    const store = this.db
      .transaction([storeName], "readwrite")
      .objectStore(storeName);

    // 仓库写入数据 updateTime：使数据唯一化
    let request = store.put({
      ...data,
      updateTime: new Date().getTime(),
    });

    // 写入成功的回调
    request.onsuccess = function (e) {
      console.log("数据写入成功");
    };

    // 写入失败的回调
    request.onerror = function (e) {
      console.log("数据写入失败");
    };
  }

  /**
   * 删除对象仓库数据 参数：仓库名、主键 
   * airbnDB.deleteItem(storeName, 2)
   */
  deleteItem(storeName: string, keyPath: string | number) {
    // 打开对象仓库
    const store = this.db
      .transaction([storeName], "readwrite")
      .objectStore(storeName);

    let request = store.delete(keyPath);

    request.onsuccess = function (e) {
      console.log("数据删除成功");
    };

    request.onerror = function (e) {
      console.log("数据删除失败");
    };
  }

  /**
   * 查询所有数据
   * airbnDB.getList(storeName)
   */
  getList(storeName: string) {
    const store = this.db.transaction(storeName).objectStore(storeName);

    const request = store.getAll();

    // 返回异步函数结果
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        console.log("查询所有数据成功");

        // 成功得到数据并返回
        resolve(event.target.result); // 成功态
      };

      request.onerror = (event: any) => {
        console.log("查询所有数据失败");

        // 返回失败结果
        reject(event); // 失败态
      };
    });
  }

  /**
   * 查询单条数据
   * airbnDB.getItem(storeName, 2)
   */
  getItem(storeName: string, key: number | string) {
    const store = this.db.transaction(storeName).objectStore(storeName);

    const request = store.get(key);

    // 返回异步函数结果
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        console.log("查询某一条数据成功");

        // 成功得到数据并返回
        resolve(event.target.result); // 成功态
      };

      request.onerror = (event: any) => {
        console.log("查询某一条数据失败");

        // 返回失败结果
        reject(event); // 失败态
      };
    });
  }
}
