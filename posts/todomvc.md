---
title: 'Using TodoMVC to learn new frontend frameworks'
date: '2021-01-08'
---

It's almost a cliché at this point, but something I like to do when I'm trying to learn about a new frontend framework is to build a todo app. There is an open source project that helps with that a lot: [TodoMVC](http://todomvc.com/).

Basically it's a set of [requirements](https://github.com/tastejs/todomvc/blob/master/app-spec.md) for a simple todo app. You need to be able to add todos, mark them as done, edit and remove them. They need to be persisted to local storage. There are some routes for filtered views. Implementing these features will give you a good initial idea what it's like to work with a framework.

There is some css and html to get you started, so you don't need to worry about those aspects and can focus fully on the logic. There's also lots of example implementations in various frameworks from [Knockout](http://todomvc.com/examples/knockoutjs) to [Elm](http://todomvc.com/examples/elm).

## A Cypress test suite for TodoMVC

I like having tests for my code, but I didn't want to rewrite them for each new framework, so I created a [Cypress](https://www.cypress.io/) test suite for TodoMVC. Cypress tests interact directly with the app in the browser, so they work regardless of the underlying technology. You can check out the full test suite (and use it yourself) on [github](https://github.com/simonpweller/todomvc-tests).

To give you a taste for what these tests look like, here's an example:
```javascript
it("should create the trimmed todo, append it to the todo list, and clear the input when Enter is pressed", () => {
    cy.get(".new-todo").type("Learn JavaScript ").type("{enter}");
    
    cy.get(".todo-list").find("li").should("have.length", 1);
    cy.get(".todo-list")
        .find("label")
        .first()
        .should("have.text", "Learn JavaScript");
    cy.get(".new-todo").should("have.value", "");
    cy.get(".toggle").should("not.be.checked");
    cy.get("li").first().should("not.have.class", "completed");
    
    cy.get(".main").should("be.visible");
    cy.get(".footer").should("be.visible");
});
```

## My implementations

So far, I have implemented TodoMVC in 5 different frameworks:
- [React](https://github.com/simonpweller/todomvc-react)
- [Svelte](https://github.com/simonpweller/todomvc-svelte)
- [Angular](https://github.com/simonpweller/todomvc-angular)
- [Vue](https://github.com/simonpweller/todomvc-vue)
- [Elm](https://github.com/simonpweller/todomvc-elm)

Time permitting, I might add write-ups here, detailing what I learned in the process. One thing I'm pretty sure about - the list will grow in time.