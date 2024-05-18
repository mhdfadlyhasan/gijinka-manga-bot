import { InteractionResponseType } from "discord-interactions";
import { json } from "itty-router";

export const ping = {
	data: {
		name: "ping",
		description: "Replies with Pong!",
	},
	
	execute() {
		return json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "sePong!"
			}
		})
	}
};
