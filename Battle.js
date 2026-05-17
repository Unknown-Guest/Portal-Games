// ===============================
// Music Monster RPG – Battle Only
// Base forms in wild, level 10 evolutions (silent)
// ===============================

const MAX_PARTY_SIZE = 6;
const EVOLUTION_LEVEL = 10;

// ---------- MONSTER DATA ----------
// All sprites load from SAME FOLDER as Battle.html

const MONSTER_DEX = {
  // Base forms
  gerret: {
    id: 'gerret',
    name: 'Gerret',
    type: 'Rock',
    baseHp: 45,
    baseAtk: 11,
    baseDef: 9,
    baseSpd: 7,
    sprite: 'costume4 (4).svg',
    evolvesTo: null,
  },
  jazz_jaguar: {
    id: 'jazz_jaguar',
    name: 'Jazz Jaguar',
    type: 'Jazz',
    baseHp: 40,
    baseAtk: 12,
    baseDef: 8,
    baseSpd: 10,
    sprite: 'costume1 (11).svg',
    evolvesTo: 'michael_jazzson',
  },
  hiphop_hound: {
    id: 'hiphop_hound',
    name: 'HipHop Hound',
    type: 'HipHop',
    baseHp: 42,
    baseAtk: 11,
    baseDef: 8,
    baseSpd: 11,
    sprite: 'costume2 (6).svg',
    evolvesTo: 'beat_dropp',
  },
edm_elemental: {
  id: 'edm_elemental',
  name: 'EDM Elemental',
  type: 'EDM',
  baseHp: 38,
  baseAtk: 13,
  baseDef: 7,
  baseSpd: 12,
  sprite: 'costume3 (6).svg',
  evolvesTo: 'beat_virus_exe',
},
eelectro: {
  id: 'eelectro',
  name: 'Eelectro',
  type: 'EDM',
  baseHp: 40,
  baseAtk: 12,
  baseDef: 8,
  baseSpd: 11,
  sprite: 'costume9 (2).svg',
  evolvesTo: 'typhlectric',
},
  metal_mammoth: {
    id: 'metal_mammoth',
    name: 'Metal Mammoth',
    type: 'Metal',
    baseHp: 60,
    baseAtk: 15,
    baseDef: 14,
    baseSpd: 6,
    sprite: 'costume7.svg',
    evolvesTo: null,
  },
  country_coyote: {
    id: 'country_coyote',
    name: 'Country Coyote',
    type: 'Country',
    baseHp: 44,
    baseAtk: 11,
    baseDef: 9,
    baseSpd: 9,
    sprite: 'costume5 (1).svg',
    evolvesTo: null,
  },
  pop_parrot: {
    id: 'pop_parrot',
    name: 'Pop Parrot',
    type: 'Pop',
    baseHp: 38,
    baseAtk: 10,
    baseDef: 8,
    baseSpd: 13,
    sprite: 'costume6 (1).svg',
    evolvesTo: 'be_ounce_y',
  },
  classical_crane: {
    id: 'classical_crane',
    name: 'Classical Crane',
    type: 'Classical',
    baseHp: 42,
    baseAtk: 10,
    baseDef: 11,
    baseSpd: 9,
    sprite: 'costume8 (3).svg',
    evolvesTo: null,
  },

  // Evolutions
  michael_jazzson: {
    id: 'michael_jazzson',
    name: 'Michael Jazzson',
    type: 'Jazz',
    baseHp: 60,
    baseAtk: 18,
    baseDef: 11,
    baseSpd: 14,
    sprite: 'costume18.svg',
    evolvesTo: null,
  },
  beat_dropp: {
    id: 'beat_dropp',
    name: 'Beat Dropp',
    type: 'HipHop',
    baseHp: 58,
    baseAtk: 17,
    baseDef: 11,
    baseSpd: 15,
    sprite: 'costume19 (1).svg',
    evolvesTo: null,
  },
  typhlectric: {
    id: 'typhlectric',
    name: 'Typhlectric',
    type: 'EDM',
    baseHp: 62,
    baseAtk: 19,
    baseDef: 11,
    baseSpd: 15,
    sprite: 'costume24.svg',
    evolvesTo: null,
  },
  beat_virus_exe: {
    id: 'beat_virus_exe',
    name: 'Beat_Virus.exe',
    type: 'EDM',
    baseHp: 64,
    baseAtk: 20,
    baseDef: 12,
    baseSpd: 14,
    sprite: 'costume20.svg',
    evolvesTo: null,
  },
  be_ounce_y: {
    id: 'be_ounce_y',
    name: 'Be-ounce-y',
    type: 'Pop',
    baseHp: 55,
    baseAtk: 17,
    baseDef: 11,
    baseSpd: 16,
    sprite: 'costume21.svg',
    evolvesTo: null,
  },
};

// Only base forms spawn in wild
const WILD_BASE_IDS = [
  'eelectro',
  'edm_elemental',
  'jazz_jaguar',
  'hiphop_hound',
  'metal_mammoth',
  'country_coyote',
  'pop_parrot',
  'classical_crane',
];

// ---------- STATE ----------

let party = [];
let activeIndex = 0;
let enemy = null;
let busy = false;

// ---------- DOM ----------

const msgBox = document.getElementById('message-box');
const partyCountSpan = document.getElementById('party-count');
const partySlotsDiv = document.getElementById('party-slots');

const playerSprite = document.getElementById('player-sprite');
const playerName = document.getElementById('player-name');
const playerLv = document.getElementById('player-lv');
const playerType = document.getElementById('player-type');
const playerHpText = document.getElementById('player-hp-text');
const playerHpBar = document.getElementById('player-hp-bar');

const enemySprite = document.getElementById('enemy-sprite');
const enemyName = document.getElementById('enemy-name');
const enemyLv = document.getElementById('enemy-lv');
const enemyType = document.getElementById('enemy-type');
const enemyHpText = document.getElementById('enemy-hp-text');
const enemyHpBar = document.getElementById('enemy-hp-bar');

const btnAttack = document.getElementById('btn-attack');
const btnCatch = document.getElementById('btn-catch');
const btnSwitch = document.getElementById('btn-switch');
const btnNew = document.getElementById('btn-new');

// ---------- HELPERS ----------

function logMessage(text) {
  msgBox.textContent = text;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createMonsterInstance(id, level) {
  const base = MONSTER_DEX[id];
  const lvl = level ?? 5;
  const maxHp = base.baseHp + (lvl - 1) * 3;
  return {
    id: base.id,
    name: base.name,
    type: base.type,
    level: lvl,
    maxHp,
    hp: maxHp,
    atk: base.baseAtk + (lvl - 1) * 2,
    def: base.baseDef + (lvl - 1),
    spd: base.baseSpd,
    sprite: base.sprite,
    evolvesTo: base.evolvesTo,
    exp: 0,
  };
}

function updatePartyUI() {
  partyCountSpan.textContent = party.length;
  partySlotsDiv.innerHTML = '';
  party.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'party-slot' + (i === activeIndex ? ' active' : '');
    div.textContent = `${m.name} Lv${m.level} (${m.hp}/${m.maxHp})`;
    div.onclick = () => {
      if (busy || !enemy || enemy.hp <= 0) return;
      if (i === activeIndex || m.hp <= 0) return;
      activeIndex = i;
      updateBattleUI();
      logMessage(`Go, ${m.name}!`);
    };
    partySlotsDiv.appendChild(div);
  });
}

function updateBattleUI() {
  const player = party[activeIndex];

  if (player) {
    playerSprite.src = player.sprite;
    playerName.textContent = player.name;
    playerLv.textContent = player.level;
    playerType.textContent = player.type;
    playerHpText.textContent = `${player.hp}/${player.maxHp}`;
    const r = player.hp / player.maxHp;
    playerHpBar.style.width = (r * 100) + '%';
    playerHpBar.style.background = r > 0.5 ? '#0f0' : r > 0.25 ? '#ff0' : '#f00';
  }

  if (enemy) {
    enemySprite.src = enemy.sprite;
    enemyName.textContent = enemy.name;
    enemyLv.textContent = enemy.level;
    enemyType.textContent = enemy.type;
    enemyHpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
    const r = enemy.hp / enemy.maxHp;
    enemyHpBar.style.width = (r * 100) + '%';
    enemyHpBar.style.background = r > 0.5 ? '#0f0' : r > 0.25 ? '#ff0' : '#f00';
  }

  updateButtons();
  updatePartyUI();
}

function updateButtons() {
  const player = party[activeIndex];
  const canAct = player && player.hp > 0 && enemy && enemy.hp > 0 && !busy;

  btnAttack.disabled = !canAct;
  btnCatch.disabled = !canAct || party.length >= MAX_PARTY_SIZE;
  btnSwitch.disabled = !canAct || party.length <= 1;
  btnNew.disabled = busy;
}

function anyPartyAlive() {
  return party.some(m => m.hp > 0);
}

function firstAliveIndex() {
  return party.findIndex(m => m.hp > 0);
}

function shakeEnemy() {
  enemySprite.classList.remove('shake');
  void enemySprite.offsetWidth;
  enemySprite.classList.add('shake');
}

// ---------- EVOLUTION ----------

function tryEvolve(mon) {
  if (!mon.evolvesTo || mon.level < EVOLUTION_LEVEL) return mon;

  const evo = MONSTER_DEX[mon.evolvesTo];
  const newMon = createMonsterInstance(evo.id, mon.level);
  return newMon;
}

function gainExp(mon, defeated) {
  mon.exp += defeated.level * 5;

  while (mon.exp >= 10) {
    mon.exp -= 10;
    mon.level++;
    mon.maxHp += 3;
    mon.atk += 2;
    mon.def += 1;
    mon.hp = mon.maxHp;

    const evolved = tryEvolve(mon);
    if (evolved !== mon) {
      const idx = party.indexOf(mon);
      party[idx] = evolved;
      mon = evolved;
    }
  }
}

// ---------- BATTLE FLOW ----------

function spawnWild() {
  const id = WILD_BASE_IDS[randInt(0, WILD_BASE_IDS.length - 1)];
  const lvl = randInt(5, 12);
  enemy = createMonsterInstance(id, lvl);
  busy = false;
  logMessage(`A wild ${enemy.name} appeared!`);
  updateBattleUI();
}

function playerAttack() {
  const player = party[activeIndex];
  busy = true;
  updateButtons();

  const dmg = Math.max(1, player.atk + randInt(-2, 3) - Math.floor(enemy.def / 3));
  enemy.hp = Math.max(0, enemy.hp - dmg);
  shakeEnemy();
  logMessage(`${player.name} attacked! It dealt ${dmg} damage.`);

  updateBattleUI();

  setTimeout(() => {
    if (enemy.hp <= 0) {
      logMessage(`${enemy.name} fainted!`);
      gainExp(player, enemy);
      enemy = null;
      busy = false;
      updateBattleUI();
      return;
    }
    enemyTurn();
  }, 700);
}

function enemyTurn() {
  const player = party[activeIndex];
  const dmg = Math.max(1, enemy.atk + randInt(-2, 3) - Math.floor(player.def / 3));
  player.hp = Math.max(0, player.hp - dmg);
  logMessage(`Wild ${enemy.name} attacked! ${player.name} took ${dmg} damage.`);
  updateBattleUI();

  setTimeout(() => {
    if (player.hp <= 0) {
      if (anyPartyAlive()) {
        activeIndex = firstAliveIndex();
        logMessage(`${player.name} fainted! Go, ${party[activeIndex].name}!`);
      } else {
        logMessage(`All your monsters fainted... your party is healed.`);
        party.forEach(m => m.hp = m.maxHp);
      }
    }
    busy = false;
    updateBattleUI();
  }, 700);
}

function tryCatch() {
  const player = party[activeIndex];
  busy = true;
  updateButtons();

  const ratio = enemy.hp / enemy.maxHp;
  let chance = 0.3;
  if (ratio < 0.5) chance += 0.25;
  if (ratio < 0.25) chance += 0.25;

  logMessage(`You threw a track orb at ${enemy.name}...`);
  shakeEnemy();

  setTimeout(() => {
    if (Math.random() < chance && party.length < MAX_PARTY_SIZE) {
      const caught = createMonsterInstance(enemy.id, enemy.level);
      party.push(caught);
      logMessage(`Gotcha! ${enemy.name} was caught!`);
      enemy = null;
    } else {
      logMessage(`${enemy.name} broke free!`);
      setTimeout(enemyTurn, 600);
      busy = false;
      updateBattleUI();
      return;
    }
    busy = false;
    updateBattleUI();
  }, 900);
}

function switchMonster() {
  if (party.length <= 1) return;
  let idx = activeIndex;
  for (let i = 0; i < party.length; i++) {
    idx = (idx + 1) % party.length;
    if (party[idx].hp > 0) {
      activeIndex = idx;
      logMessage(`You switched to ${party[idx].name}!`);
      updateBattleUI();
      return;
    }
  }
  logMessage(`No other monsters can fight!`);
}

// ---------- EVENTS ----------

btnAttack.onclick = () => {
  if (!enemy || busy) return;
  playerAttack();
};

btnCatch.onclick = () => {
  if (!enemy || busy) return;
  if (party.length >= MAX_PARTY_SIZE) {
    logMessage('Your party is full!');
    return;
  }
  tryCatch();
};

btnSwitch.onclick = () => {
  if (!enemy || busy) return;
  switchMonster();
};

btnNew.onclick = () => {
  if (busy) return;
  spawnWild();
};

// ---------- INIT ----------

function initParty() {
  const starter1 = createMonsterInstance('gerret', 5);
  const starter2 = createMonsterInstance('eelectro', 5);
  party = [starter1, starter2];
  activeIndex = 0;
}

window.onload = () => {
  initParty();
  spawnWild();
  updateBattleUI();
};

