const APIController = require('./apiController');

const options = {
  clientName: 'Tsumugu',
  secure: false
};

const apiController = new APIController(options);

const sendQueryToVNDB = async (query) => {
  try {
    const queryResponse = await apiController.query(query);
    return queryResponse;
  } catch (err) {
    console.log(err);
    return 'error';
  }
};

// Max querySize = 100
// PageNumber starts at 1
const getQueryPage = async (query, querySize, pageNumber) => {
  const queryOptions = {
    page: pageNumber,
    results: querySize
  };
  const response = await sendQueryToVNDB(query + JSON.stringify(queryOptions));
  return response;
};

const handlePageQuery = async (query, querySize) => {
  let finalResponse = [];
  let currentResponse;
  let pageNumber = 0;
  do {
    currentResponse = await getQueryPage(query, querySize, ++pageNumber);
    if (currentResponse === 'error') return currentResponse;
    finalResponse = [...finalResponse, ...Object.keys(currentResponse.items).map(e => currentResponse.items[e])];
  } while (currentResponse.more);
  return finalResponse;
};

// Query size of 20 here to play safe
const getVNInfo = async (vnIDs) => {
  const response = await handlePageQuery(`get vn basic,details (id = [${vnIDs}])`, 20);
  return response;
};

exports.getUserList = async (userID) => {
  const response = await handlePageQuery(`get vnlist basic, (uid = ${userID})`, 100);
  return response;
};

exports.getUserByID = async (userID) => {
  const response = await sendQueryToVNDB(`get user basic, (id = ${userID})`);
  return response === 'error' ? response : response.items;
};

exports.getUserByName = async (username) => {
  const response = await sendQueryToVNDB(`get user basic, (username = "${username}")`);
  return response === 'error' ? response : response.items;
};

// List with only title, image and status
exports.getFormatedUserList = async (userID) => {
  const unformatedList = await getUserList(userID);
  if (unformatedList === 'error') return unformatedList;
  const vnIDs = unformatedList.map(e => e.vn);
  const vnInfos = await getVNInfo(vnIDs);
  if (vnInfos === 'error') return vnInfos;
  const formatedList = vnInfos.map((e, i) => {
    return ({
      id: e.id,
      link: e.link,
      title: e.title,
      image: e.image,
      imageNSFW: e.image_nsfw,
      status: unformatedList[i].status
    });
  });
  return formatedList.sort((a, b) => a.title.localeCompare(b.title));
};