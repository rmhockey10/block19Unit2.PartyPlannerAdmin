// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2412-ftb-et-web-am"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function addParty(newParty) {
  try {
    await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newParty),
    });
    await getParties();
  } catch (e) {
    console.log(e);
  }
}

async function deleteParty(id) {
  try {
    await fetch(API + "/events/" + id, { method: "DELETE" });
    await getParties();
  } catch (error) {
    console.error(error);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button>Delete</button>
  `;

  const $button = $party.querySelector("button");
  $button.addEventListener("click", () => {
    deleteParty(selectedParty.id);
    selectedParty = null;
  });
  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function PartyForm() {
  $form = document.createElement("form");
  $form.innerHTML = `
  <label>
  Name
  <input name="name"/>
  </label>

  <label>
  Description
  <input name="description"/>
  </label>

  <label>
  Date
  <input name="date" type="date"/>
  </label>
  
  <label>
  Location
  <input name="location"/>
  </label>
    <button>Add Party</button>
  `;
  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData($form);
    const date = data.get("date");
    const isoDate = new Date(date).toISOString();
    const newParty = {
      name: data.get("name"),
      description: data.get("description"),
      date: isoDate,
      location: data.get("location"),
    };
    addParty(newParty);
  });
  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <PartyForm></PartyForm>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("PartyForm").replaceWith(PartyForm());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
