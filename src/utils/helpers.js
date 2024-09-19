export const timeStamp = () => Math.floor(Date.now() / 1000)

const encrypt = (text) => {
    const key = 'pFfSeLGbi4ioo0ehN9ZzP94C2q2pr9Sy';
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const encryptedValue = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return {encryptedValue, iv: iv.toString('hex')};
};


export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function getDateFormat(uDate, option) {
    return new Intl.DateTimeFormat('fa-IR', option).format(uDate);
}

export function formatNumberWithCommas(number) {
    if (!number)
        return '';
    number += ''
    if (number.length <= 3)
        return number;
    number = number.split('.')
    number[0] = number[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    if (number[1]) {
        number[1] = number[1].split('').reverse().join('').replace(/\B(?=(\d{3})+(?!\d))/g, ',').split('').reverse().join('')
        return number[0] + '.' + number[1]
    }
    return number[0];
}

export function PersianNumberToEnglish(number) {
    number = number.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    number = number.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    return number;
}

export function getPTime() {
    const today = Date.now();
    const time = getDateFormat(today, {hour: '2-digit', minute: '2-digit', hour12: false}).split(':');
    const hour = PersianNumberToEnglish(time[0]) * 1
    const minute = PersianNumberToEnglish(time[1]) * 1
    return {
        hour,
        minute
    }
}

export function convertArabicCharacterToFa(string) {
    const characters = {
        'ك': 'ک',
        'دِ': 'د',
        'بِ': 'ب',
        'زِ': 'ز',
        'ذِ': 'ذ',
        'شِ': 'ش',
        'سِ': 'س',
        'ى': 'ی',
        'ي': 'ی',
        '١': '۱',
        '٢': '۲',
        '٣': '۳',
        '٤': '۴',
        '٥': '۵',
        '٦': '۶',
        '٧': '۷',
        '٨': '۸',
        '٩': '۹',
        '٠': '۰'
    };
    return string.split('').map(char => characters[char] || char).join('');
}


export function truncateText(text, truncateLength = 18) {
    text += '';
    const words = text.replaceAll("\n", " ").trim().split(' ');
    let charCount = 0;
    let selectedWords = [];

    for (const word of words) {
        charCount += word.length;
        if (charCount > truncateLength) {
            break;
        }
        selectedWords.push(word);
    }

    return selectedWords.join(' ');
}

