const USER_ID = ""
const API_TOKEN = ""
const WEB_APP_URL = ""
const RESET_TIME = [2,0] //hour,minute //before you start working on your Dailies of the day

const authorID = "236f76d4-3789-4866-aade-9f8be9d72fef"
const scriptName = "Profile Dailies Progress Bar"
const headers = {
  "x-client" : authorID + "-" + scriptName,
  "x-api-user" : USER_ID,
  "x-api-key" : API_TOKEN
}

const scriptProperties = PropertiesService.getScriptProperties()
// This is to avoid fetching data of all the Dailies from Habitica every time

function setup(){

  ScriptApp.newTrigger("resetToZero").timeBased().atHour(RESET_TIME[0]).nearMinute(RESET_TIME[1]).everyDays(1).create()
  // Can replace "resetToZero" with "reload" if genuine need
  
  createWebhook()
  
  reload() //to calculate Dailies and put/replace progress bar on profile

}

function resetToZero(){
  /*
  Using this 'cause function declaration progress(fraction=0) doesn't work with the trigger, nor does calling progress(0) in the trigger
  */
  progress(0)
}

function reload(){

  const params = {
    "method" : "get",
    "headers" : headers
  }
  const response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user?type=dailys", params)
  const dailies = JSON.parse(response).data

  let totalDue = totalDueAndCompleted = 0
  for (let i in dailies){
    if (dailies[i].isDue) {
      totalDue++
      if (dailies[i].completed)
        totalDueAndCompleted++
    }
  }

  progress(totalDueAndCompleted / totalDue)
  scriptProperties.setProperty("totalDue", totalDue)
  scriptProperties.setProperty("totalDueAndCompleted", totalDueAndCompleted)

}

function doPost(e){
  
  const contents = JSON.parse(e.postData.contents)
  const type = contents.type

  if (type == "updated"){ //this is tricky, so reloading
    reload()
  }
  else if (contents.task.isDue){ // the task may not be due if it's for a future date

    let totalDue = scriptProperties.getProperty("totalDue")
    let totalDueAndCompleted = scriptProperties.getProperty("totalDueAndCompleted")

    if(type == "created")
      totalDue++
    else{
      const isCompleted = contents.task.completed
      if(type == "deleted"){
        totalDue--
        if(isCompleted)
          totalDueAndCompleted--
      }
      else //i.e. if(type == "scored") //type "scored" refers to both scored and unscored, difference is in "isCompleted"
        isCompleted ? totalDueAndCompleted++ : totalDueAndCompleted--
    }

    scriptProperties.setProperty("totalDue", totalDue)
    scriptProperties.setProperty("totalDueAndCompleted", totalDueAndCompleted)
    progress(totalDueAndCompleted / totalDue)
    
  }
  
  return HtmlService.createHtmlOutput()

}

function progress(fraction){
  const percent = Math.round(100*fraction)
  const profileBio = "My Dailies' Progress:\n\n![](https://progress-bar.dev/"+percent+"/)"
  const params = {
    "method" : "put",
    "headers" : headers,
    "contentType" : "application/json",
    "payload" : JSON.stringify({"profile.blurb": profileBio})
  }
  UrlFetchApp.fetch("https://habitica.com/api/v3/user", params)
}

function createWebhook() {

  const payload = {
    "url" : WEB_APP_URL,
    "label" : scriptName,
    "type" : "taskActivity",
    "options" : {
      "created" : true,
      "updated" : true,
      "deleted" : true,
      "scored" : true
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
