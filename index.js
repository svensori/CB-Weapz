var request = require("request");

/**
 * Filter params
 */
const params = {
  // water, fire, earth, lightning, leave blank for any
  element: '',
  weaponStars: 3,
  minPrice: 0,
  maxPrice: 0.7,
  numOfPages: 99,
  fromPage: 1,
  pure: true
}

/**
 * Constants
 */
const STAT_MAP = {
  charisma: 'lightning',
  strength: 'fire',
  intelligence: 'water',
  dexterity: 'earth'
};

console.clear();
showItemSearchInfo();
getWeapons(buildRequestUrls());

function getWeapons(requestUrls) {
  requestUrls.forEach((url, i) => {
    setTimeout(() => {
      request.get(url, (error, response, body) => {
        const itemList = JSON.parse(response.body);
        const result = (itemList.results || [])
                        .sort(sortPrice)
                        .filter(filterPrice)
                        .filter(filterPure)
                        .map(mapResultOutput);
        console.log(`Page ${i + params.fromPage}: `);
        result.forEach(e => console.log(e));
      });
    }, i * 6000)
  });
}

function filterPrice(weapon) { 
  const marketPrice = getMarketPrice(weapon.price);
  return marketPrice >= params.minPrice && marketPrice <= params.maxPrice;
}

function sortPrice(w1, w2) {
  return w1.price - w2.price;
}

function filterPure(weapon) {
  if (!params.pure) { return true; }
  const weaponElement = weapon.weaponElement;
  const s1Match = weaponElement === STAT_MAP[weapon.stat1Element];
  const s2Match = weaponElement === STAT_MAP[weapon.stat2Element];
  const s3Match = weaponElement === STAT_MAP[weapon.stat3Element];
  if (params.weaponStars === 5) {
    return s1Match && s2Match && s3Match;
  } else if (params.weaponStars === 4) {
    return s1Match && s2Match;
  } else {
    return s1Match
  } 
}

function mapResultOutput(weapon) {
  const element = elem => elem.substring(0, 3).toUpperCase();
  const s1 = `${element(weapon.stat1Element)}(${weapon.stat1Value})`;
  const s2 = `${element(weapon.stat2Element)}(${weapon.stat2Value})`;
  const s3 = `${element(weapon.stat3Element)}(${weapon.stat3Value})`;
  const stats = `${!!weapon.stat1Element ? s1: ''} ${!!weapon.stat2Element ? s2 : ''} ${!!weapon.stat3Element ? s3 : ''}`.trim();

  return `${weapon.weaponId.padEnd(7)} - ${element(weapon.weaponElement)} - ${stats} - ${getMarketPrice(weapon.price)}`
}

const getMarketPrice = price => parseFloat(price + (price * 0.1)).toFixed(3);

function showItemSearchInfo() {
  console.log(new Date());
  console.log(`Showing ${params.pure ? 'pure ' : ''}${params.weaponStars}* weapons (${!!params.element ? params.element : 'all'}), under ${params.maxPrice} SKILL.`);
}

function buildRequestUrls() {
  const urls = [];
  const startPage = params.fromPage;
  const endPage = params.numOfPages + params.fromPage;
  for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
    urls.push(`https://api.cryptoblades.io/static/market/weapon?element=${params.element}&minStars=${params.weaponStars}&maxStars=${params.weaponStars}&pageSize=60&pageNum=${currentPage}`);
  }
  return urls;
}