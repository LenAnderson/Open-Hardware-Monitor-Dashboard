import { wait } from "./basics.js";
import { Binding } from "./Binding.js";

export class Dialog {
	/**@type{HTMLDivElement}*/ blocker;
	/**@type{HTMLDivElement}*/ content;
	/**@type{HTMLDivElement}*/ header;
	/**@type{HTMLDivElement}*/ body;
	/**@type{HTMLDivElement}*/ footer;

	/**@type{String}*/ title;
	/**@type{String}*/ affirmative = 'OK';
	/**@type{String}*/ negative = null;

	/**@type{HTMLElement}*/ trigger;

	/**@type{Promise}*/ outcome;
	/**@type{Function}*/ outcomeResolver;




	constructor(/**@type{String}*/title, /**@type{String}*/affirmative='OK', /**@type{String}*/negative=null) {
		this.buildDom();

		this.title = title;
		this.affirmative = affirmative;
		this.negative = negative;
	}

	buildDom() {
		const blocker = document.createElement('div'); {
			this.blocker = blocker;
			blocker.classList.add('ohmd--dialog--blocker');
			const content = document.createElement('div'); {
				this.content = content;
				content.classList.add('ohmd--dialog--content');
				const header = document.createElement('div'); {
					this.header = header;
					header.classList.add('ohmd--dialog--header');
					Binding.create(this, this, 'title', header, 'textContent');
					content.append(header);
				}
				const body = document.createElement('div'); {
					this.body = body;
					body.classList.add('ohmd--dialog--body');
					content.append(body);
				}
				const footer = document.createElement('div'); {
					this.footer = footer;
					footer.classList.add('ohmd--dialog--footer');
					const affBtn = document.createElement('button'); {
						affBtn.classList.add('ohmd--dialog--button--affirmative');
						Binding.create(this, this, 'affirmative', affBtn, 'textContent');
						affBtn.addEventListener('click', ()=>this.hide(true));
						footer.append(affBtn);
					}
					const negBtn = document.createElement('button'); {
						negBtn.classList.add('ohmd--dialog--button--negative');
						Binding.create(this, this, 'negative', negBtn, 'textContent');
						Binding.create(this, this, 'negative', negBtn.style, 'display', v=>v===null?'none':'');
						negBtn.addEventListener('click', ()=>this.hide(false));
						footer.append(negBtn);
					}
					content.append(footer);
				}
				blocker.append(content);
			}
			document.body.append(blocker);
		}
	}




	async show(/**@type{HTMLElement}*/trigger) {
		this.outcome = new Promise(resolve=>this.outcomeResolver=resolve);
		this.trigger = trigger;
		this.blocker.classList.add('ohmd--dialog--preactive');

		const rect = this.content.getBoundingClientRect();
		const triggerRect = trigger.getBoundingClientRect();
		const x = `${Math.round((triggerRect.left + triggerRect.width * 0.5) - (rect.left + rect.width * 0.5))}px`;
		const y = `${Math.round((triggerRect.top + triggerRect.height * 0.5) - (rect.top + rect.height * 0.5))}px`;
		this.content.style.transform = `translate(${x}, ${y}) scale(0)`;
		await wait(20);

		this.blocker.classList.add('ohmd--dialog--active');
		await wait(410);
		this.content.style.transition = 'all 400ms ease-in-out';
	}

	async hide(/**@type{Boolean}*/isAffirmative) {
		if (this.trigger) {
			await this.hideToTrigger();
		} else {
			await this.hideToTop();
		}
		this.outcomeResolver(isAffirmative);
	}

	async hideToTrigger() {
		const rect = this.content.getBoundingClientRect();
		const triggerRect = this.trigger.getBoundingClientRect();
		const x = `${Math.round((triggerRect.left + triggerRect.width * 0.5) - (rect.left + rect.width * 0.5))}px`;
		const y = `${Math.round((triggerRect.top + triggerRect.height * 0.5) - (rect.top + rect.height * 0.5))}px`;
		this.content.style.transform = `translate(${x}, ${y}) scale(0)`;

		this.blocker.classList.remove('ohmd--dialog--active');
		await wait(400);

		this.blocker.classList.remove('ohmd--dialog--preactive');
		this.content.style.transform = '';
		this.content.style.transition = '';
		this.trigger = null;
	}

	async hideToTop() {
		const rect = this.content.getBoundingClientRect();
		this.content.style.transform = `translate(0, ${-rect.bottom}px) scale(1)`;

		this.blocker.classList.remove('ohmd--dialog--active');
		await wait(400);

		this.blocker.classList.remove('ohmd--dialog--preactive');
		this.content.style.transform = '';
		this.content.style.transition = '';
		this.trigger = null;
	}

	remove() {
		this.blocker.remove();
		Binding.remove(this);
	}
}