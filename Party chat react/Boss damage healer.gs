let stats, totalInt

function getUserProfile(){
  const API_URL = "https://habitica.com/api/v3/user?userFields=stats"
  stats = JSON.parse(UrlFetchApp.fetch(API_URL, {"method":"get", "headers":headers})).data.stats
}

function bossDamageHealer(damage){
  getUserProfile()
  if(stats.lvl >= 14){
    levelBonus = stats.lvl > 100 ? 50 : Math.floor(stats.lvl/2)
    const unbuffedCon = stats.con + levelBonus + EQUIPMENT_STATS.Con
    totalInt = stats.int + levelBonus + EQUIPMENT_STATS.Int + stats.buffs.int
    const BlessingPower = (unbuffedCon + stats.buffs.con + totalInt + 5) * 0.04
    if(damage > BlessingPower){
      //calculating no. of times to cast "Protective Aura" to be able to heal in a single "Blessing"
      const n = Math.ceil((damage-BlessingPower)*(0.125 + 25/unbuffedCon))
      castSkill("protectAura",n)
    }
    castSkill("healAll",1)
  }
}

function castSkill(skill,nTimes){
  const skillCost = skill == "protectAura" ? 30 : 25
  const ManaRequirement = skillCost*nTimes
  const sleepTime = 2000
  if(stats.mp < ManaRequirement){ //then buy Mana potion
    const maxMana = 2*totalInt + 30
    const newMana = ManaRequirement > maxMana ? ManaRequirement : maxMana
    const newGP = stats.gp - (newMana - stats.mp)
    const buyManaPotion = {
    "method" : "put",
    "headers" : headers,
    "contentType" : "application/json",
    "payload" : JSON.stringify({"stats.mp":newMana, "stats.gp":newGP})
    }
    UrlFetchApp.fetch("https://habitica.com/api/v3/user", buyManaPotion)
    Utilities.sleep(sleepTime)
  }
  for(let i = 0; i < nTimes; i++){
    UrlFetchApp.fetch("https://habitica.com/api/v3/user/class/cast/"+skill, {"method":"post", "headers":headers})
    Utilities.sleep(sleepTime)
  }
}
