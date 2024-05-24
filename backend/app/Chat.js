class Chat {

   #logLength = 25;
   #messages = [];

   constructor() { }

   addMessage(message, playerNumber, nickname) {
      this.#messages.push({
         message: message,
         playerNumber: playerNumber,
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