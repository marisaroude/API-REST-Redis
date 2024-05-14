
async function getList(db, name_list) {
    let list = db?.lRange(name_list, 0, -1);
    return list
}

module.exports = getList