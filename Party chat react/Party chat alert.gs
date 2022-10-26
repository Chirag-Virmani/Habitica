function partyChatAlert(chat){
  let mailSubject = false
  if(chat.info.type == "quest_abort")
    mailSubject = "Habitica quest " + chat.info.quest + " aborted"
  else if(chat.info.type == "spell_cast_user" && chat.info.target == DISPLAY_NAME)
    mailSubject = "Habitica transformation spell"
  if(mailSubject)
    MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: mailSubject,
    htmlBody: chat.unformattedText
    })
}
