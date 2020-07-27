const fetch = require('node-fetch')
const { Headers } = require('node-fetch')
const tabletojson = require('tabletojson').Tabletojson
const fs = require("fs")
const path = require("path")

const TelegramBot = require('node-telegram-bot-api')
const token = '753068368:AAElXsXh_SJd_Fzw_2Sa_W0cKCfrFTeTIsk'
const botId = 753068368
var bot = new TelegramBot(token, {polling:true})
const request = require('request')
const { stringify } = require('querystring')

// API for DLU Schedule
const date = new Date()
const year = date.getFullYear()
const month = date.getMonth()

var myHeaders = new Headers()
myHeaders.append("Content-Type", "application/x-www-form-urlencoded")
myHeaders.append("Cookie", "ASP.NET_SessionId=bzulevyezystzq1rgijv5z2g")

var urlencoded = new URLSearchParams()
urlencoded.append("txtTaiKhoan", "1714178")
urlencoded.append("txtMatKhau", "19031999")

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
}

var yearStudy = ""
var termID = ""
var week = ""

// Regex kiểm tra năm và học kỳ hợp lệ
const yearImportRegex = new RegExp('^[0-9]{4}-[0-9]{4}$')
const termImportRegex = new RegExp('^(HK0[1-3])|(hk0[1-3])|(hK0[1-3])|(Hk0[1-3])$')

const getYearAndTermStudy = () => {
  if (
    (month === 0) |
    (month === 1) |
    (month === 2) |
    (month === 3) |
    (month === 4) |
    (month === 5) |
    (month === 6)
  ) {
    yearStudy = `${year - 1}-${year}`
    termID = `HK02`
  } else if (month === 7) {
    yearStudy = `${year - 1}-${year}`
    termID = `HK03`
  } else {
    console.log(`${year}-${year + 1}`)
    yearStudy = `${year}-${year + 1}`
    termID = `HK01`
  }
}

const getWeek = () => {
  let onejan = new Date(date.getFullYear(), 0, 1)
  week = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7)
}

getYearAndTermStudy()
getWeek()

// postLogin()
// getSchedule()

bot.onText(/^!echo (.+)/, function(msg, match){
    var chatId = msg.chat.id
    var name = msg.from.first_name + " " + msg.from.last_name
    var echo = name + ': ' + match[1]
    console.log(echo)
    bot.sendMessage(chatId, echo)
})

bot.onText(/^!send (.+)/, function(msg, match){
    let message = match[1]
    let name = msg.from.first_name + " " + msg.from.last_name
    if(message.includes('all')){
        message = message.slice(message.indexOf('all') + 3).trim()
        message += '\n\nGửi bởi: ' + name;
        if(message !== ''){
            sendMessageFromBotToGroup('all', message)
        }
        else{
            bot.sendMessage(msg.chat.id, 'Chưa nhập vào nội dung cần gửi đi')
        }
    }
    else if(message.includes('[') && message.includes(']')){
        let groupName = message.slice(message.indexOf('[') + 1, message.indexOf(']'))
        message = message.slice(message.indexOf(']') + 1).trim()
        // message += '\n\nGửi bởi: ' + name;
        if(message !== ''){
            sendMessageFromBotToGroup(groupName, message)
        }
        else{
            bot.sendMessage(msg.chat.id, 'Chưa nhập vào nội dung cần gửi đi')
        }
    }
    else{
        bot.sendMessage(msg.chat.id, 'Sai cú pháp send\n!send [tên nhóm] Nội dung gửi\n!send [tên nhóm 1, tên nhóm 2, ...] Nội dung gửi\nGửi tất cả các nhóm: !send all Nội dung gửi')
    }
})

bot.onText(/^!sendpic (.+)/, function(msg, match){
    let message = match[1]
    let name = msg.from.first_name + " " + msg.from.last_name
    if(message.includes('all')){
        message = message.slice(message.indexOf('all') + 3).trim()
        message += '\n\nGửi bởi: ' + name;
        if(message !== ''){
            sendPhotoFromBotToGroup('all', message)
        }
        else{
            bot.sendMessage(msg.chat.id, 'Chưa nhập vào nội dung cần gửi đi')
        }
    }
    else if(message.includes('[') && message.includes(']')){
        let groupName = message.slice(message.indexOf('[') + 1, message.indexOf(']'))
        message = message.slice(message.indexOf(']') + 1).trim()
        // message += '\n\nGửi bởi: ' + name;
        if(message !== ''){
            sendPhotoFromBotToGroup(groupName, message)
        }
        else{
            bot.sendMessage(msg.chat.id, 'Chưa nhập vào nội dung cần gửi đi')
        }
    }
    else{
        bot.sendMessage(msg.chat.id, 'Sai cú pháp send\n!sendpic [tên nhóm] Nội dung gửi\n!sendpic [tên nhóm 1, tên nhóm 2, ...] Nội dung gửi\nGửi tất cả các nhóm: !sendpic all Nội dung gửi')
    }
})

bot.on("left_chat_member", function(msg) {
    const member = msg.left_chat_member
    const id = msg.chat.id
    if(member.id != botId){
        const answer = 'Tạm biệt ' + member.first_name + ' 🖐🖐'
        bot.sendMessage(id, answer)
    }
})

bot.on("new_chat_members", function(msg) {
    const name = msg.from.first_name + " " + msg.from.last_name
    const listMembers = msg.new_chat_members
    const chat = msg.chat
    for(let i = 0; i < listMembers.length; i++){
        const member = listMembers[i]
        if(member.id === botId){
            const answer = 'Chào tất cả mọi người, tui tên là ' + member.first_name + '\nTui được mời vào phòng này bởi ' + name
            bot.sendMessage(chat.id, answer)
            appendToFile('name.txt', chat)
        }
        else{
            const answer = 'Chào mừng ' + member.first_name + ' đến với nhóm chat ' + chat.title + '\nBạn được mời vào phòng này bởi ' + name
            bot.sendMessage(chat.id, answer)
        }
    }
})

bot.onText(/zoro|Zoro/, function(msg, match){
    var id = msg.chat.id
    var roomName = msg.chat.title
    var name = msg.from.first_name + " " + msg.from.last_name
    var text = match['input']
    var lText = text.split(' ')
    var answer

    if(lText.includes("lạc")) {
        answer = "Chào " + name + ", tao vẫn đi lạc đều đều nhé 🥱🥱"
        bot.sendMessage(id, answer)
    }
    else if(lText.includes('room')) {
        checkRoom(msg, 'all')
    }
    else if(lText.includes('phòng') || lText.includes('Phòng')) {
        if(lText.includes('id') || lText.includes('Id')) checkRoom(msg, 'id')
        if(lText.includes('kiểu') || lText.includes('loại')) checkRoom(msg, 'type')
        if(lText.includes('tên') || lText.includes('Tên')) checkRoom(msg, 'name')
    }
    else if(text == "zoro" || text == "Zoro") {
        bot.sendMessage(id, "Hả 🤨🤨")
        appendToFile('name.txt', msg.chat)
    }
    else if(lText.includes("ơi") || lText.includes("à") || lText.includes("ê") || lText.includes("Ê")) {
        bot.sendMessage(id, "Ai gọi tao đó, có mặt chó tao đây. Ahihi 🤪🤪")
    }
    else if(lText.includes("chào") || lText.includes("Chào") || lText.includes("Hi") || lText.includes("Hello")) {
        answer = "Chào " + name + " nhé ✌️"
        bot.sendMessage(id, answer)
    }
    else if(lText.includes("Việt") || lText.includes("việt")) {
        bot.sendMessage(id, "Việt là ông chủ đẹp trai đã tạo ra tui, thật đó.. :v Đẹp nhất quả đất này luôn... 🤣🤣🤣")
    }
    else if(lText.includes("ngu") || lText.includes("Ngu")) {
        answer = "Gửi " + name + ", tao thông minh hơn mày đấy 😤😤"
        bot.sendMessage(id, answer)
    }
    else if(lText.includes("giết") || lText.includes("nó")) {
        answer = "Tuân lệnh thuyền trưởng, để em giết hết 🤧😤"
        bot.sendMessage(id, answer)
    }
    else {
        answer = "Chào " + name + ", hiện tui chưa hiểu mấy cái này nhé 😰😰"
        bot.sendMessage(id, answer)
    }
})

bot.onText(/^!phim (.+)/, function(msg, match){
    var movie = match[1]
    var chatId = msg.chat.id
    request(`http://www.omdbapi.com/?apikey=46ba3d40&t=${movie}`,function(error,response,body){
        if(!error && response.statusCode == 200){
            bot.sendMessage(chatId, '_Đang tìm phim ' + movie + '..._', {parse_mode:'Markdown'})
            .then(function(msg){
                var res = JSON.parse(body)
                if(res.Response == "True"){
                    bot.sendPhoto(chatId, res.Poster, {caption: 'Kết quả:\nTên phim: ' + res.Title + '\nNăm: ' + res.Year
                    + '\nĐánh giá: ' + res.Rated + '\nĐiểm Imdb: ' + res.imdbRating
                    + '\nPhát hành: ' + res.Released + '\nThời lượng: ' + res.Runtime + '\nThể loại: ' + res.Genre
                    + '\nĐạo diễn: ' + res.Director + '\nDiễn viên: ' + res.Actors
                    + '\nNgôn ngữ phim: ' + res.Language + '\nQuốc gia: ' + res.Country})
                }
                else {
                    bot.sendMessage(chatId, 'Em xin lỗi, em tìm không thấy phim "' + movie + '" này. 😶😶😶')
                }
            })
        }
    })
})

bot.onText(/^!tkb (.+)/, async function(msg, match){
    var text = match[1]
    var chatId = msg.chat.id
    
    let arrText = text.split(' ')
    let idImport = arrText[0]
    let yearImport = arrText[1]
    let termImport = arrText[2]
    let weekImport = arrText[3]
    let schedule = await getSchedule(idImport, yearImport, termImport, weekImport)

    if(schedule !== ''){
        schedule = JSON.parse(schedule)
        let result = handleScheduleJSON(schedule)
        bot.sendMessage(chatId, result)
    }
    else {
        bot.sendMessage(chatId, 'Nhập sai cú pháp rồi')
    }
})

function checkRoom(msg, typeToCheck){
    let answer = ''
    if(typeToCheck === 'id'){
        answer = 'ID phòng này là: ' + msg.chat.id
    }
    else if(typeToCheck === 'name'){
        answer = 'Tên phòng này là: ' + msg.chat.title
    }
    else if(typeToCheck === 'type'){
        answer = 'Kiểu phòng này là: ' + msg.chat.type
    }
    else if(typeToCheck === 'all'){
        answer = 'Tên phòng này là: ' + msg.chat.title + '\nID phòng này là: ' + msg.chat.id + '\nLoại phòng: ' + msg.chat.type
    }

    if(answer !== ''){
        bot.sendMessage(msg.chat.id, answer)
    }
}

function appendToFile(filename, chat){
    console.log('Data prepare to write: ' + chat.id + '|' + chat.title)
    if(chat.type === 'group' || chat.type === 'supergroup'){
        if(isContain(filename, chat) == false){
            let data = chat.id + '|' + chat.title + '\n'
            fs.appendFile(filename, data, 'utf8', function(error){
                if(error) throw error
                else console.log('Write group name successful' + '\nData: ' + data)
            })
        }
    }
}

function isContain(filename, chat){
    const data = fs.readFileSync('./' + filename, {encoding:'utf8'})
    let items = data.split('\n')
    items.pop()
    for(let element of items){
        let item = element.split('|');
        if(chat.title === item[1]){
            return true
        }
    }
    return false
}

function sendMessageFromBotToGroup(groupName, message){
    const data = fs.readFileSync('./name.txt', {encoding:'utf8'})
    let items = data.split('\n')
    items.pop()
    if(groupName === 'all'){
        for(let obj of items){
            let item = obj.split('|')
            bot.sendMessage(item[0], message)
        }
    }
    else{
        listGroup = groupName.split(',');
        for(let obj of items){
            let item = obj.split('|')
            for(let group of listGroup){
                group = group.trim();
                if(item[1] === group){
                    bot.sendMessage(item[0], message)
                }
            }
        }
    }
}

function sendPhotoFromBotToGroup(groupName, message){
    const data = fs.readFileSync('./name.txt', {encoding:'utf8'})
    let items = data.split('\n')
    items.pop()
    
    let url = message.split(' ')[0]
    let cap = message.split(' ')
    cap.shift();
    cap = cap.join(' ')
    console.log(url + ' | ' + message)

    if(groupName === 'all'){
        for(let obj of items){
            let item = obj.split('|')
            bot.sendPhoto(item[0], url, {caption: cap})
        }
    }
    else{
        listGroup = groupName.split(',');
        for(let obj of items){
            let item = obj.split('|')
            for(let group of listGroup){
                group = group.trim();
                if(item[1] === group){
                    bot.sendPhoto(item[0], url, {caption: cap})
                }
            }
        }
    }
}

async function postLogin(requestOptions) {
    await fetch("http://online.dlu.edu.vn/Login", requestOptions)
    .then(response => response.text())
    .catch(error => console.log('error', error))
}

async function getSchedule(idImport, yearImport, termImport, weekImport){
    await postLogin(requestOptions)
    
    if (typeof(Number(idImport)) === 'number' & Number(idImport) > 0){
        let url = await `http://online.dlu.edu.vn/Home/DrawingStudentSchedule?StudentId=${Number(idImport)
        }&YearId=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
        }&TermId=${termImportRegex.test(termImport) ? termImport : termID
        }&WeekId=${(typeof(Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week}`

        await getScheduleFromURLAndWriteToFile(url)
    }
    else if (typeof(idImport) === 'string' & idImport.length >= 5 & idImport.length <= 12){
        let url = await `http://online.dlu.edu.vn/Home/DrawingClassStudentSchedules_Mau2?ClassStudentID=${idImport
        }&YearStudy=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
        }&TermId=${termImportRegex.test(termImport) ? termImport : termID
        }&Week=${(typeof(Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week}`
        console.log(url)
        await getScheduleFromURLAndWriteToFile(url)
    }
    else {
        return ''
    }

    return await handleDataScheduleToJSON()
}

async function getScheduleFromURLAndWriteToFile(url){
    await fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
        fs.writeFileSync('index.html', result, 'utf8', function(error){
            if(error) throw error
            else console.log("Write log successful")
        })
    })
    .catch(error => console.log('error', error))
}

async function handleDataScheduleToJSON() {
    const fileHTML = await fs.readFileSync(
        path.resolve(__dirname, './index.html'),
        { encoding: "UTF-8" }
    )
    let tablesAsJson = await tabletojson.convert(fileHTML, {
      useFirstRowForHeadings: true
    })
    let result = await tablesAsJson[0]
    return JSON.stringify(result)
}

function handleScheduleJSON(schedule){
    let output = '===================='
    let str = ''
    for(let i = 1; i < schedule.length; i++){
        let item = schedule[i]
        str = ''
        str += '\n' + item['0'] + '\n--------------------'
        if(item['Sáng'] !== ''){
            str += '\nSáng\n--------------------'
            str += '\n' + handleScheduleEntry(item['Sáng']) +'\n--------------------'
        }
        else if(item['Chiều'] !== ''){
            str += '\nChiều\n--------------------'
            str += '\n' + handleScheduleEntry(item['Chiều']) +'\n--------------------'
        }
        else if(item['Tối'] !== ''){
            str += '\nTối\n--------------------'
            str += '\n' + handleScheduleEntry(item['Tối']) +'\n--------------------'
        }
        else{
            str = ''
        }
        
        if(str !== ''){
            output += str + '\n===================='
        }
    }

    if(output === '===================='){
        return 'Không có lịch học tuần này'
    }
    return output
}

function handleScheduleEntry(inputEntry){

    let list = inputEntry.split('   ')
    let output = ''
    for(let i = 0; i < list.length; i++){
        if(i !== 0){
            output += '\n--------------------\n'
        }
        let str = []
        str[0] = list[i].slice(list[i].indexOf('-Môn: '), list[i].indexOf('-Nhóm: '))
        str[1] = list[i].slice(list[i].indexOf('-Nhóm: '), list[i].indexOf('-Lớp: '))
        str[2] = list[i].slice(list[i].indexOf('-Lớp: '), list[i].indexOf('-Tiết: '))
        str[3] = list[i].slice(list[i].indexOf('-Tiết: '), list[i].indexOf('-GV: '))
        str[4] = list[i].slice(list[i].indexOf('-GV: '), list[i].indexOf('-Đã học: '))
        str[5] = list[i].slice(list[i].indexOf('-Đã học: '))
        output += str.join('\n')
    }

    return output
}

/*
😀😃😄😁😆😅😂🤣😊😇
🙂🙃😉😌😍🥰😘😗😙😚
😋😛😝😜🤪🤨🧐🤓😎🤩
🥳😏😒😞😔😟😕🙁☹️😣
😖😫😩🥺😢😭😤😠😡🤬
🤯😳🥵🥶😱😨😰😥😓🤗
🤔🤭🤫🤥😶😐😑😬🙄😯
😦😧😮😲🥱😴🤤😪😵🤐
🥴🤢🤮🤧😷🤒🤕🤑🤠😈
👿👹🤡💩👻💀☠️👽👾🤖
🎃👎👍✌️✊👊💪👌👉👈🖐
 */