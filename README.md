## GramJS Sample Project

##### This project demonstrates some key capabilities of the GramJS library. It implements both the Bot and Client modes using MTProxy without relying on webhooks..

### Features:

* **Bot and Client Functionality:** Implements both bot and client functionalities using GramJS.
* **MTProxy Support:** Leverages MTProxy for enhanced privacy and performance.
* **Hook-less Implementation:** The project is implemented without webhooks, offering a simpler approach.
* **Channel News Aggregation and Moderation:** The bot can subscribe to multiple channels, aggregate news, and present it to a moderator for approval.
* **Inline Keyboard for Moderation:** Moderators can approve or reject news items using inline keyboard buttons.
* **Automated Publication:** Approved news is automatically published to a designated channel.

### Getting Started:

1. **Clone the repository:** 

```plaintext
git clone https://github.com/rezavar/telegram-bot-news-channel.git
```

2. **Install dependencies:** 
    
```plaintext
npm i
```

3. Configure your credentials: 
    Replace your config in ./src/config/main-local.js:
```plaintext
export const API_ID = Your_API_ID;
export const API_HASH = Your_API_HASH;
export const BOT_TOKEN = Your_BOT_TOKEN;
```

4. Run the bot : 

```plaintext
node news_channel.js
```


### How it works:

* **Add channels and moderators:**  Use the bot's commands to add channels to monitor and assign moderators.
* **News aggregation:** The bot continuously monitors the added channels for new posts.
* **Moderation:** Moderators receive the aggregated news in a group and can approve or reject items using inline buttons.
* **Publication:** Approved news is automatically forwarded to the designated publication channel.
