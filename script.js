const terminal = document.getElementById("terminal");
const output = document.getElementById("output");
const userInput = document.getElementById("user-input");

const cv = {
  name: "Your Name",
  contact: {
    email: "your.email@example.com",
    phone: "(123) 456-7890",
    location: "City, Country",
  },
  experience: [
    {
      title: "Software Developer",
      company: "Tech Solutions Inc.",
      period: "Jan 2020 - Present",
      description:
        "Developed and maintained web applications using React and Node.js.",
    },
    {
      title: "Junior Developer",
      company: "StartUp Co.",
      period: "Jun 2018 - Dec 2019",
      description:
        "Assisted in the development of mobile applications using Flutter.",
    },
  ],
  education: [
    {
      degree: "BSc in Computer Science",
      school: "University of Technology",
      year: "2018",
    },
  ],
  skills: [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Git",
    "Agile methodologies",
  ],
};

const commands = {
  help: () => `Available commands:
- whoami: Display personal information
- experience: Show work experience
- education: Display education information
- skills: List skills
- clear: Clear the terminal
- help: Show this help message`,
  whoami: () => `<h1>${cv.name}</h1>
<p>Email: ${cv.contact.email}</p>
<p>Phone: ${cv.contact.phone}</p>
<p>Location: ${cv.contact.location}</p>`,
  experience: () => `<h2>Work Experience</h2>
${cv.experience
  .map(
    (job) => `<ul>
<li>
<strong>${job.title} - ${job.company}</strong><br>
${job.period}<br>
${job.description}
</li>
</ul>`,
  )
  .join("")}`,
  education: () => `<h2>Education</h2>
${cv.education
  .map(
    (edu) => `<ul>
<li>
<strong>${edu.degree} - ${edu.school}</strong><br>
Graduated: ${edu.year}
</li>
</ul>`,
  )
  .join("")}`,
  skills: () => `<h2>Skills</h2>
<ul>
${cv.skills.map((skill) => `<li>${skill}</li>`).join("")}
</ul>`,
  clear: () => {
    output.innerHTML = "";
    return "";
  },
};

function processCommand(cmd) {
  const trimmedCmd = cmd.trim().toLowerCase();
  if (commands.hasOwnProperty(trimmedCmd)) {
    return commands[trimmedCmd]();
  } else {
    return `Command not found: ${cmd}. Type 'help' for available commands.`;
  }
}

function addToTerminal(content, isCommand = false) {
  const div = document.createElement("div");
  div.innerHTML = isCommand
    ? `<div class="prompt command">${content}</div>`
    : `<div class="output">${content}</div>`;
  output.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

userInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    const cmd = this.value;
    addToTerminal(cmd, true);
    const result = processCommand(cmd);
    addToTerminal(result);
    this.value = "";
  }
});

// Initial greeting
addToTerminal(
  `Welcome to ${cv.name}'s interactive CV! Type 'help' for available commands.`,
);
