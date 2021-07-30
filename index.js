var request = require("request");

/**
 * Filter params
 */
const params = {
  // water, fire, earth, lightning, leave blank for any
  element: '',
  weaponStars: 5,
  minPrice: 0,
  maxPrice: 1111,
  numOfPages: 4,
  pure: true
}

/**
 * Constants
 */
const STAT_MAP = {
  charisma: 'lightning',
  strength: 'fire',
  intelligenece: 'water',
  dexterity: 'earth'
};

showItemSearchInfo();
getWeapons(buildRequestUrls());

function getWeapons(requestUrls) {
  requestUrls.forEach((url, i) => {
    setTimeout(() => {
      request.get(url, (error, response, body) => {  
        const itemList = JSON.parse(response.body);

        const result = itemList.results 
          .sort(sortPrice)
          .filter(filterPrice)
          .filter(filterPure)
          .map(mapResultOutput);

        console.log(`Page ${i + 1}: `, result);
      });
    }, i * 5000)
  });
}

function filterPrice(weapon) { 
  const marketPrice = (weapon.price * 0.10) + weapon.price;
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
  const s1 = weapon.stat1Element.substring(0,3).toUpperCase();
  const s2 = weapon.stat2Element.substring(0,3).toUpperCase();
  const s3 = weapon.stat3Element.substring(0,3).toUpperCase();
  const element = weapon.weaponElement.substring(0,3).toUpperCase();
  return {
    i: weapon.weaponId,
    e: element,
    s: `${s1} ${s2} ${s3}`.trim(),
    p: (weapon.price + (weapon.price * 0.1)).toFixed(3)
  };
}

function showItemSearchInfo() {
  console.log(new Date());
  console.log(`Showing ${params.pure ? 'pure ' : ''}${params.weaponStars}* weapons (${!!params.element ? params.element : 'all'}), under ${params.maxPrice} SKILL.`);
}

function buildRequestUrls() {
  const urls = [];
  for (let currentPage = 1; currentPage <= params.numOfPages; currentPage++) {
    urls.push(`https://api.cryptoblades.io/static/market/weapon?element=${params.element}&minStars=${params.weaponStars}&maxStars=${params.weaponStars}&sortBy=&sortDir=&pageSize=60&pageNum=${currentPage - 1}`);
  }
  return urls;
}