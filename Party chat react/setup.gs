const USER_ID = ""
const API_TOKEN = ""
const ENABLED = {"Party chat alert":true, "Boss damage healer":false}
const DISPLAY_NAME = "" //for alerting when transformation item is used on you
const EQUIPMENT_STATS = {Int:0, Con:0} //with addition of class bonus //for calculating effects of "Blessing" and "Protective Aura"
const WEB_APP_URL = ""

const authorID = "236f76d4-3789-4866-aade-9f8be9d72fef"
const scriptName = "Party chat react"
const headers = {
  "x-client" : authorID + "-" + scriptName,
  "x-api-user" : USER_ID,
  "x-api-key" : API_TOKEN
}

function setup(){
  createWebhook()
}

function doPost(e){
  const chat = JSON.parse(e.postData.contents).chat
  if(ENABLED["Boss damage healer"] && chat.info.type == "boss_damage"){
    bossDamage = Number(chat.info.bossDamage)
    if(bossDamage ^ bossDamage)
      bossDamageHealer(bossDamage)
  }
  else if(ENABLED["Party chat alert"])
    partyChatAlert(chat)
  return HtmlService.createHtmlOutput()
}

function createWebhook() {

  //fetching party ID first
  const API_URL = "https://habitica.com/api/v3/user?userFields=party._id"
  const partyID = JSON.parse(UrlFetchApp.fetch(API_URL, {"method":"get", "headers":headers})).data.party._id

  const payload = {
    "url" : WEB_APP_URL,
    "label" : scriptName,
    "type" : "groupChatReceived",
    "options" : {
      "groupId" : partyID
    }
  }

  const params = {
    "method" : "post",
    "headers" : headers,
    "contentType" : "application/json",
    "payload" : JSON.stringify(payload)
  }

  UrlFetchApp.fetch("https://habitica.com/api/v3/user/webhook", params)

}
