class Chat {

   #logLength = 25;
   #messages = [];

   constructor() { }

   addMessage(message, nickname) {
      this.#messages.push({
         message: message,
         nickname: nickname
      });
      if (this.#messages.length > this.#logLength) {
         this.#messages.shift();
      }
   }

   getMessages(amount = this.#logLength) {
      return this.#messages.slice(-amount);
   }
}

module.exports = Chat;