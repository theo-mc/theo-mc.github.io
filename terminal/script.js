import { resume } from "./resume.js";

class Terminal {
  constructor() {
    this.terminal = document.getElementById("terminal");
    this.output = document.getElementById("output");
    this.userInput = document.getElementById("user-input");
    this.sidebar = document.getElementById("sidebar");
    this.themeSelect = document.getElementById("theme-select");
    this.menuBtn = document.getElementById("menu-btn");
    this.mainContent = document.getElementById("main-content");
    this.terminalContent = document.getElementById("terminal-content");

    this.commandHistory = [];
    this.historyIndex = -1;

    this.commands = {
      help: this.helpCommand.bind(this),
      whoami: this.whoamiCommand.bind(this),
      experience: this.experienceCommand.bind(this),
      education: this.educationCommand.bind(this),
      skills: this.skillsCommand.bind(this),
      projects: this.projectsCommand.bind(this),
      clear: this.clearCommand.bind(this),
      neofetch: this.neofetchCommand.bind(this),
      ls: this.lsCommand.bind(this),
      cat: this.catCommand.bind(this),
      echo: this.echoCommand.bind(this),
    };

    this.isSidebarOpen = false;
    this.loadCommandHistory();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSavedTheme();
    this.openSidebar(); // Start with closed sidebar
  }

  setupEventListeners() {
    this.userInput.addEventListener("keydown", this.handleUserInput.bind(this));
    this.themeSelect.addEventListener("change", this.changeTheme.bind(this));
    this.menuBtn.addEventListener("click", this.toggleSidebar.bind(this));
    this.setupSidebarItemListeners();
    // Add click event listener to the terminal
    this.terminal.addEventListener("click", this.focusInput.bind(this));
  }

  setupSidebarItemListeners() {
    this.sidebar.querySelectorAll(".sidebar-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const command = item.getAttribute("command");
        if (command) {
          this.runCommand(command);
        }
      });
    });
  }

  toggleSidebar() {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    this.sidebar.classList.remove("collapsed");
    this.mainContent.classList.remove("full-width");
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.sidebar.classList.add("collapsed");
    this.mainContent.classList.add("full-width");
    this.isSidebarOpen = false;
  }

  loadCommandHistory() {
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      this.commandHistory = JSON.parse(savedHistory);
    }
  }

  saveCommandHistory() {
    localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory.slice(0, 50)));
  }

  loadSavedTheme() {
    let savedTheme = localStorage.getItem("theme");
    
    if (!savedTheme) {
      savedTheme = "tokyonight";
      localStorage.setItem("theme", savedTheme);
    }
    
    this.themeSelect.value = savedTheme;
    this.changeTheme();
  }

  changeTheme() {
    const theme = this.themeSelect.value;
    document.body.className = theme !== "default" ? `theme-${theme}` : "";
    localStorage.setItem("theme", theme);
  }

  handleUserInput(event) {
    if (event.key === "Enter") {
      this.handleEnterKey();
    } else if (event.key === "ArrowUp") {
      this.handleArrowUp(event);
    } else if (event.key === "ArrowDown") {
      this.handleArrowDown(event);
    } else if (event.key === "Tab") {
      this.handleTabKey(event);
    }
  }

  handleEnterKey() {
    const cmd = this.userInput.value.trim();
    if (cmd) {
      this.commandHistory.unshift(cmd);
      this.historyIndex = -1;
      this.runCommand(cmd);
      this.userInput.value = "";
      this.saveCommandHistory();
    }
  }

  handleArrowUp(event) {
    event.preventDefault();
    this.navigateHistory(1);
  }

  handleArrowDown(event) {
    event.preventDefault();
    this.navigateHistory(-1);
  }

  handleTabKey(event) {
    event.preventDefault();
    this.autocomplete();
  }

  navigateHistory(direction) {
    if (this.commandHistory.length > 0) {
      this.historyIndex = Math.min(
        Math.max(this.historyIndex + direction, 0),
        this.commandHistory.length - 1
      );
      this.userInput.value = this.commandHistory[this.historyIndex];
    }
  }

  autocomplete() {
    const input = this.userInput.value.toLowerCase();
    const matchingCommands = Object.keys(this.commands).filter((cmd) =>
      cmd.startsWith(input)
    );
    if (matchingCommands.length === 1) {
      this.userInput.value = matchingCommands[0];
    } else if (matchingCommands.length > 1) {
      const commonPrefix = this.findCommonPrefix(matchingCommands);
      this.userInput.value = commonPrefix;
      this.addToTerminal(`Matching commands: ${matchingCommands.join(", ")}`);
    }
  }

  findCommonPrefix(strings) {
    if (strings.length === 0) return '';
    return strings.reduce((prefix, string) => {
      while (string.indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
      }
      return prefix;
    });
  }

  runCommand(cmd) {
    this.addToTerminal(cmd, true);
    const result = this.processCommand(cmd);
    this.addToTerminal(result);
    this.userInput.focus();
  }

  processCommand(cmd) {
    const [command, ...args] = cmd.trim().toLowerCase().split(' ');
    if (this.commands.hasOwnProperty(command)) {
      return this.commands[command](args);
    } else {
      return `Command not found: ${command}. Type 'help' for available commands.`;
    }
  }

  // New method to focus on the input
  focusInput(event) {
    // Check if the click is not on the input itself to avoid unnecessary focus
    if (event.target !== this.userInput) {
      this.userInput.focus();
    }
  }

  scrollToBottom() {
    this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
  }

  addToTerminal(content, isCommand = false) {
    const div = document.createElement("div");
    div.innerHTML = isCommand
      ? `<div class="prompt command">${content}</div>`
      : `<div class="output">${content}</div>`;
    this.output.appendChild(div);
    this.scrollToBottom();
  }


  helpCommand() {
    return `
      <h2>Available Commands:</h2>
      <ul>
        <li><strong>whoami</strong>: Display personal information</li>
        <li><strong>experience</strong>: Show work experience</li>
        <li><strong>education</strong>: Display education information</li>
        <li><strong>skills</strong>: List skills</li>
        <li><strong>projects</strong>: Show personal projects</li>
        <li><strong>clear</strong>: Clear the terminal</li>
        <li><strong>neofetch</strong>: Display system information</li>
        <li><strong>ls</strong>: List available files</li>
        <li><strong>cat [filename]</strong>: Display file contents</li>
        <li><strong>echo [text]</strong>: Display a line of text</li>
        <li><strong>help</strong>: Show this help message</li>
      </ul>
    `;
  }

  whoamiCommand() {
	const { name, contact, personalStatement } = resume.header;
	return `
			<h1>${name}</h1>
			<p><i class="fas fa-envelope"></i> Email: ${contact.email}</p>
			<p><i class="fas fa-phone"></i> Phone: ${contact.phone}</p>
			<p><i class="fab fa-github"></i> GitHub: ${contact.github}</p>
			<p>${personalStatement}</p>`;
  }

  experienceCommand() {
	return `
			<h2><i class="fas fa-briefcase"></i> Work Experience</h2>
			${resume.experience
			  .map(
				(job) => `
				<div class="job">
					<h3>${job.title} - ${job.company}</h3>
					<p><i class="far fa-calendar-alt"></i> ${job.period}</p>
					<p>${job.description}</p>
					<ul>
						${job.achievements.map((achievement) => `<li>${achievement}</li>`).join("")}
					</ul>
				</div>`,
			  )
			  .join("")}
		`;
  }

  educationCommand() {
	return `
			<h2><i class="fas fa-graduation-cap"></i> Education</h2>
			${resume.education
			  .map(
				(edu) => `
				<div class="education">
					<h3>${edu.qualification} - ${edu.school}</h3>
					<p><i class="far fa-calendar-alt"></i> Graduation Date: ${edu.graduationYear}</p>
					${
					  edu.modules
						? `
						<p><strong>Modules:</strong></p>
						<ul>
							${edu.modules.map((module) => `<li>${module}</li>`).join("\n                            ")}
						</ul>
					`
						: ""
					}
					${
					  edu.courses
						? `
						<p><strong>Courses:</strong></p>
						<ul>
							${edu.courses.map((course) => `<li>${course.name}: ${course.grade}</li>`).join("\n                            ")}
						</ul>
					`
						: ""
					}
				</div>
			`,
			  )
			  .join("\n            ")}
		`;
  }

  skillsCommand() {
	const { technical, soft } = resume.skills;

	setTimeout(() => {
	  document.querySelectorAll(".progress").forEach((progress) => {
		progress.style.width = progress.dataset.level + "%";
	  });
	}, 100);

	return `
			<h2><i class="fas fa-code"></i> Skills</h2>
			<h3>Technical Skills</h3>
			${Object.entries(technical)
			  .map(
				([skill, level]) => `
				<div class="skill">
					<h4>${skill}</h4>
					<div class="progress-bar">
						<div class="progress" data-level="${level * 10}" style="width: 0%"></div>
					</div>
				</div>
			`,
			  )
			  .join("")}
			<h3>Soft Skills</h3>
			<ul>
				${soft.map((skill) => `<li>${skill}</li>`).join("")}
			</ul>
		`;
  }

  projectsCommand() {
	return `
			<h2><i class="fas fa-project-diagram"></i> Projects</h2>
			${resume.projects
			  .map(
				(project) => `
				<div class="project">
					<h3>${project.title}</h3>
					<p>${project.description}</p>
					<p><strong>Technologies:</strong> ${project.technologies.join(", ")}</p>
					<p><strong>Highlights:</strong></p>
					<ul>
						${project.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
					</ul>
				</div>
			`,
			  )
			  .join("")}
		`;
  }

  neofetchCommand() {
    const osLogo = 
	`
	████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
	╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
	   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
	   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
	   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
	   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
    `;

    const info = `
    OS: Interactive Resume OS
    Host: ${resume.header.name}'s Portfolio
    Kernel: JavaScript ES6+
    Shell: Interactive Terminal
    DE: Web Browser
    WM: DOM
    Terminal: Custom Web Terminal
    CPU: User's Device
    Memory: Browser Allocated
    `;

    return `<pre>${osLogo}${info}</pre>`;
  }

  lsCommand() {
	const sections = Object.keys(resume);
	return `
	  <ul>
		${sections.map(section => `<li>${section}.txt</li>`).join('')}
	  </ul>
	`;
  }

  catCommand(args) {
	let section = args[0];
  if (section.endsWith('.txt')) {
    section = section.slice(0, -4);
  }
	if (!section) {
	  return "Usage: cat [section]";
	}
	if (resume.hasOwnProperty(section)) {
	  return this.formatSection(section, resume[section]);
	} else {
	  return `Section not found: ${section}`;
	}
  }

  formatSection(section, content) {
	if (typeof content === 'string') {
	  return content;
	} else if (Array.isArray(content)) {
	  return content.map(item => this.formatObject(item)).join('\n\n');
	} else if (typeof content === 'object') {
	  return this.formatObject(content);
	}
	return JSON.stringify(content, null, 2);
  }
  
  formatObject(obj) {
	return Object.entries(obj)
	  .map(([key, value]) => {
		if (typeof value === 'object' && !Array.isArray(value)) {
		  return `${key}:\n${this.formatObject(value)}`;
		} else if (Array.isArray(value)) {
		  return `${key}:\n${value.map(item => `  - ${item}`).join('\n')}`;
		} else {
		  return `${key}: ${value}`;
		}
	  })
	  .join('\n');
  }

  echoCommand(args) {
    return args.join(' ');
  }

  clearCommand() {
	this.output.innerHTML = "";
	return "";
  }

  loadCommandHistory() {
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      this.commandHistory = JSON.parse(savedHistory);
    }
  }

  saveCommandHistory() {
    localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory.slice(0, 50)));
  }
}

document.addEventListener("DOMContentLoaded", () => new Terminal());
