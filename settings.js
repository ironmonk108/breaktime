import { BreakTime, i18n } from "./breaktime.js";

export const registerSettings = function () {
	// Register any custom module settings here
	let modulename = "breaktime";

	let notifyoptions = {
		'none': 'None',
		'chat': 'Chat Message',
		'toast': 'Notification',
		'both': 'Chat & Notification'
	};

	game.settings.register(modulename, "paused", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	game.settings.register(modulename, "away", {
		scope: "world",
		config: false,
		default: [],
		type: Object,
	});

	game.settings.register(modulename, "break", {
		scope: "world",
		config: false,
		default: {},
		type: Object,
	});

	game.settings.register(modulename, "start", {
		scope: "world",
		config: false,
		default: {},
		type: Object,
	});
	game.settings.register(modulename, "remaining", {
		scope: "world",
		config: false,
		default: null,
		type: Object,
	});

	game.settings.register(modulename, "auto-pause", {
		name: i18n("BREAKTIME.setting.auto-pause.name"),
		hint: i18n("BREAKTIME.setting.auto-pause.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	game.settings.register(modulename, "twenty-four-hour", {
		name: i18n("BREAKTIME.setting.twenty-four-hour.name"),
		hint: i18n("BREAKTIME.setting.twenty-four-hour.hint"),
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(modulename, "show-button", {
		name: i18n("BREAKTIME.setting.show-button.name"),
		hint: i18n("BREAKTIME.setting.show-button.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register(modulename, "away-text", {
		name: i18n("BREAKTIME.setting.away-text.name"),
		scope: "client",
		config: true,
		default: i18n("BREAKTIME.app.away"),
		type: String,
	});

	game.settings.register(modulename, "back-text", {
		name: i18n("BREAKTIME.setting.back-text.name"),
		scope: "client",
		config: true,
		default: i18n("BREAKTIME.app.back"),
		type: String,
	});
	game.settings.register(modulename, "notify-option", {
		name: i18n("BREAKTIME.setting.notify-option.name"),
		hint: i18n("BREAKTIME.setting.notify-option.hint"),
		scope: "world",
		default: "chat",
		type: String,
		choices: notifyoptions,
		config: true
	});
	game.settings.register(modulename, "chat-bubble", {
		name: i18n("BREAKTIME.setting.chat-bubble.name"),
		hint: i18n("BREAKTIME.setting.chat-bubble.hint"),
		scope: "world",
		default: false,
		type: Boolean,
		config: true
	});
	game.settings.register(modulename, "break-sound", {
		name: i18n("BREAKTIME.setting.break-sound.name"),
		hint: i18n("BREAKTIME.setting.break-sound.hint"),
		scope: "world",
		config: true,
		default: "modules/breaktime/sounds/break.mp3",
		type: String,
		filePicker: 'audio',
	});
	game.settings.register(modulename, "break-playlist", {
		name: i18n("BREAKTIME.setting.break-playlist.name"),
		hint: i18n("BREAKTIME.setting.break-playlist.hint"),
		scope: "world",
		default: "",
		type: String,
		choices: [],
		config: true
	});
	game.settings.register(modulename, "end-break-sound", {
		name: i18n("BREAKTIME.setting.end-break-sound.name"),
		hint: i18n("BREAKTIME.setting.end-break-sound.hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
		filePicker: 'audio',
	});
	game.settings.register(modulename, "volume", {
		name: i18n("BREAKTIME.setting.volume.name"),
		hint: i18n("BREAKTIME.setting.volume.hint"),
		scope: "client",
		config: true,
		range: {
			min: 0,
			max: 100,
			step: 10,
		},
		default: 60,
		type: Number,
	});
	game.settings.register(modulename, "break-time", {
		name: i18n("BREAKTIME.setting.break-time.name"),
		hint: i18n("BREAKTIME.setting.break-time.hint"),
		scope: "world",
		config: true,
		default: 5,
		type: Number,
	});

	game.settings.register(modulename, "auto-start-time", {
		name: i18n("BREAKTIME.setting.auto-start-time.name"),
		hint: i18n("BREAKTIME.setting.auto-start-time.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(modulename, "currently-playing", {
		scope: "world",
		config: false,
		default: "",
		type: Object,
	});

	/*
	game.settings.register(modulename, "slideshow", {
		name: i18n("BREAKTIME.setting.slideshow.name"),
		scope: "world",
		config: game.modules.get("monks-enhanced-journal")?.active,
		default: "",
		choices: () => {
			return {
				"": "",
				...game.journal
					.filter(j => {
						return j.pages.size == 1 && getProperty(j.pages.contents[0], "flags.monks-enhanced-journal.type") == "slideshow"
					})
					.reduce((acc, page) => {
						let { id, name } = page;
						return { ...acc, [id]: name };
					}, {})
			};
		},
		type: String,
	});
	*/
}