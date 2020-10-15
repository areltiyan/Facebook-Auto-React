const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const delay = require('delay');
const {
    question
} = require('readline-sync');

const URL_FACEBOOK = 'https://mbasic.facebook.com';

const blueBright = (log) => console.log(chalk.blueBright(log))
const bgGreen = (log) => console.log(chalk.bgGreen(log))
const green = (log) => console.log(chalk.green(log))
const red = (log) => console.log(chalk.red(log))
const yellow = (log) => console.log(chalk.yellow(log))
const yegreen = (yellow, green) => console.log(chalk.yellow(yellow), chalk.green(green))

yellow(`
   █████  ██    ██ ████████  ██████      ██████  ███████  █████   ██████ ████████  
  ██   ██ ██    ██    ██    ██    ██     ██   ██ ██      ██   ██ ██         ██     
  ███████ ██    ██    ██    ██    ██     ██████  █████   ███████ ██         ██    
  ██   ██ ██    ██    ██    ██    ██     ██   ██ ██      ██   ██ ██         ██  
  ██   ██  ██████     ██     ██████      ██   ██ ███████ ██   ██  ██████    ██ 
  ============================================\n  - Auto React Facebook By AREL TIYAN @10-2020\n  - This tool is free, and has been shared in the SGB Group`)
red('  - Check your cookies.txt before using this tool!\n  - DO WITH YOUR OWN RISK!');
yellow('  ============================================')
if (!fs.existsSync('cookies.txt')) return red('[!] cookies.txt Not found !')
yellow(`  - Type React :
    0. Like
    1. Super
    2. Care
    3. Haha
    4. Wow
    5. Sad
    6. Angry
    7. Random\n`)

const COOKIES = fs.readFileSync('cookies.txt', {
    encoding: 'utf-8'
});

function getIds(q) {
    return q.match(/\?ft_id=(.*)&origin_uri=/) ? q.match(/\?ft_id=(.*)&origin_uri=/)[1] : q.match(/\?ft_ent_identifier=(.*)&reaction_type=/) ? q.match(/\?ft_ent_identifier=(.*)&reaction_type=/)[1] : null;
};

const headers = {
    headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en-US,en;q=0.9,id;q=0.8',
        cookie: COOKIES,
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
    },
};

const getBeranda = () => new Promise(async (resolve, reject) => {
    try {
        const JSON = {
            status: true,
            ids: [],
            idPostFriend: 0,
            idPostGroup: 0
        }
        yellow('[!] Trying Get Post')
        const getHome = await axios.get(URL_FACEBOOK, headers);
        if (getHome.data && !getHome.data.includes('name="login"')) {
            $ = cheerio.load(getHome.data);
            $('a').each(async (i, x) => {
                const y = x.attribs.href;
                const z = getIds(y);
                if (y.includes('reactions/picker') && !(fs.readFileSync('ids.txt', {
                        encoding: 'utf-8'
                    })).includes(z)) {
                    JSON.ids.push({
                        id: z,
                        link: URL_FACEBOOK + y
                    });
                    y.includes('page_id_type') ? JSON.idPostGroup++ : JSON.idPostFriend++
                }
            });
            JSON.idPostFriend == 0 && JSON.idPostGroup == 0 ? resolve({
                status: false
            }) : resolve(JSON)
        } else red('[!] Error, check your cookies [maybe Expired]!');
    } catch (error) {
        reject(error);
    }
});

const getLinkReact = (link) => new Promise(async (resolve, reject) => {
    try {
        const JSON = {
            status: true,
            link: []
        }
        const getReact = await axios.get(link, headers);
        if (getReact.data) {
            $ = cheerio.load(getReact.data);
            $('a').each(async (i, x) => {
                const y = x.attribs.href;
                if (y.includes('ufi/reaction')) {
                    JSON.link.push(URL_FACEBOOK + y);
                }
            });
            JSON.link.length == 0 ? resolve({
                status: false
            }) : resolve(JSON)
        }
    } catch (error) {
        reject(error);
    }
});

const startReact = (link) => new Promise(async (resolve, reject) => {
    try {
        const id = getIds(link)
        const goReact = await axios.get(link, headers);
        if (goReact.data) {
            fs.appendFileSync('ids.txt', id + ',')
            resolve({
                status: true
            });
        }
    } catch (error) {
        resolve({
            status: false
        });
    }
});

(async () => {

    const react_type = question(blueBright(' > React type? : '))
    if (react_type > 7) return red('[!] Check your react type !')
    const second = question(blueBright(' > Delay get Post [seconds] : '))
    if (isNaN(second)) return red('[!] Check your delay get Post !')
    const second2 = question(blueBright(' > Delay react [seconds] : '))
    if (isNaN(second2)) return red('[!] Check your delay react !')

    while (1) {
        try {
            const getPost = await getBeranda();
            if (getPost.status) {
                yellow('[!] Detected Post!');
                yegreen('   - From Friends', `[${getPost.idPostFriend}]`);
                yegreen('   - From Groups', `[${getPost.idPostGroup}]`);
                yellow('[!] Trying Get React')
                for (let i = 0; i < getPost.ids.length; i++) {
                    const getReact = await getLinkReact(getPost.ids[i].link)
                    const type = react_type == 7 ? Math.floor(Math.random() * getReact.link.length) : react_type
                    const type_text = type == 0 ? 'Like' : type == 1 ? 'Super' : type == 2 ? 'Care' : type == 3 ? 'Haha' : type == 4 ? 'Wow' : type == 5 ? 'Sad' : 'Angry';
                    if (getReact.status) {
                        const go = await startReact(getReact.link[type])
                        go.status == true ? green(`[+] Success react id -> ${getPost.ids[i].id} [${type_text}]`) : red(`[+] Error react id -> ${getPost.ids[i].id} [${type_text}]`) 
                    } else {
                        red('[!] Error get react link!');
                    }
                    green(`[!] Delay react ! ${second2}s`)
                    await delay(parseInt(second2, 10) * 1000); 
                }
            } else {
                red('[!] Error, post not found!');
            }
            green(`[!] Delay Get Post ! ${second}s`)
            await delay(parseInt(second, 10) * 1000);   
        } catch (error) {
            red(error)
        }
    }
})();
