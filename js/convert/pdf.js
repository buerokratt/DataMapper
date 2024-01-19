export const generateHTMLTable = (chatHistoryTable, { messages, csaTitleVisible, csaNameVisible }) => {    
  let _html = `<tr class="header">
                  <th style="text-align: left">Autor</th>
                  <th style="text-align: left">Sõnum</th>
                  <th style="text-align: left">Aeg</th>
              </tr>`;

  for (let i = 0; i < messages.length; i++) {
    const { author, message, date } = extractMessageInfo(messages[i], csaTitleVisible, csaNameVisible);

    _html += `<tr>
            <td style="padding-right: 50px; border-bottom:1px solid lightgray">${author}</td>
            <td style="padding-right: 50px; border-bottom:1px solid lightgray">${message}</td>
            <td style="padding-right: 50px; border-bottom:1px solid lightgray">${date}</td>
        </tr>`;
  }

  chatHistoryTable.innerHTML = _html;
};

const extractMessageInfo = (message, csaTitleVisible, csaNameVisible) => {
  const author = extractAuthor(message, csaTitleVisible, csaNameVisible)

  const date = new Date(message.created).toLocaleDateString("et-EE");
  const time = new Date(message.created).toLocaleTimeString("et-EE");

  const content = message.content ? decodeURIComponent(message.content) : message.content;
  const messageContent = content || t(message.event) || "-";

  return {
    author,
    message: messageContent,
    date: `${time} ${date}`,
  }
}

const t = (event) => {
  return eventTranslation[event] || event;
}

const extractAuthor = (message, csaTitleVisible, csaNameVisible) => {
  const role = message.authorRole;

  if(role === "end-user")
    return "Klient";
  if(role === "buerokratt")
    return "Bürokratt";
  if(role === 'backoffice-user') {
    if(csaTitleVisible && csaNameVisible)
      return (message.csaTitle + " " + message.authorFirstName + " " + message.authorLastName).trim();
    if(csaTitleVisible)
      return message.csaTitle;
    if(csaNameVisible)
      return (message.authorFirstName + " " + message.authorLastName).trim();
    return "Klienditeenindaja";
  }
  return role;
}

const eventTranslation = {
  "answered": "Vastatud",
  "terminated": "Määramata",
  "sent_to_csa_email": "Vestlus saadetud klienditeenindaja e-mailile",
  "client-left": "Klient lahkus",
  "client_left_with_accepted": "Klient lahkus aktsepteeritud vastusega",
  "client_left_with_no_resolution": "Klient lahkus vastuseta",
  "client_left_for_unknown_reasons": "Klient lahkus määramata põhjustel",
  "accepted": "Aktsepteeritud",
  "hate_speech": "Vihakõne",
  "other": "Muud põhjused",
  "response_sent_to_client_email": "Kliendile vastati tema jäetud kontaktile",
  "greeting": "Tervitus",
  "requested-authentication": "Küsiti autentimist",
  "authentication_successful": "Autoriseerimine oli edukas",
  "authentication_failed": "Autoriseerimine ei olnud edukas",
  "ask-permission": "Küsiti nõusolekut",
  "ask-permission-accepted": "Nõusolek aktsepteeritud",
  "ask-permission-rejected": "Nõusolek tagasi lükatud",
  "ask-permission-ignored": "Nõusolek ignoreeritud",
  "rating": "Hinnang",
  "contact-information": "Küsiti kontakti infot",
  "contact-information-rejected": "Kontakti info tagasi lükatud",
  "contact-information-fulfilled": "Kontakti info täidetud",
  "requested-chat-forward": "Küsiti vestluse suunamist",
  "requested-chat-forward-accepted": "Vestluse suunamine aktsepteeritud",
  "requested-chat-forward-rejected": "Vestluse suunamine tagasi lükatud",
  "inactive-chat-ended": "Lõpetatud tegevusetuse tõttu",
  "message-read": "Loetud",
  "contact-information-skipped": "Kontaktandmeid pole esitatud",
  "unavailable-contact-information-fulfilled": "Kontaktandmed on antud",
  "unavailable_organization": "Organisatsioon pole saadaval",
  "unavailable_csas": "CSA-d pole saadaval",
  "unavailable_holiday": "Puhkus"
}
