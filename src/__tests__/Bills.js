/**
 * @jest-environment jsdom
 */



import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
//import { ROUTES_PATH } from "../constants/routes.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"
// Dans un autre fichier





describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML);
      const antiChrono = (a, b) => {
        // Convertissez les dates en objets Date pour comparer les timestamps
        const dateA = new Date(a);
        const dateB = new Date(b);
        // Comparez les timestamps des dates
        if (dateA.getTime() === dateB.getTime()) {
          return 0;
        }
        // Tri du plus récent au plus ancien
        return dateA > dateB ? -1 : 1;
      };
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("on ouvre une modale quand on clique sur l'icone de l'oeil", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firestore = null;
      const newBill = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();

      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn()
      iconEye.addEventListener("click", handleClickIconEye)
      fireEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()

    })

    test("Création d'une nouvelle facture, quand on clique sur newBill", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const newBill = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      const handleClickNewBill = jest.fn(newBill.handleClickNewBill);
      const newBillBtn = screen.getByTestId("btn-new-bill");
      newBillBtn.addEventListener("click", handleClickNewBill);
      fireEvent.click(newBillBtn);
      expect(handleClickNewBill).toHaveBeenCalled();
    });

  })
})





// ---- TEST NON FONCTIONNEL ----

// it('test si limage est bien affichée dans la modale', () => {
//   // Crée un élément div factice pour la modale
//   const modal = document.createElement('div');
//   modal.setAttribute('id', 'modaleFile');
//   modal.innerHTML = `<div class="modal-body"></div>`;

//   // Crée un élément icon factice avec l'attribut data-bill-url
//   const icon = document.createElement('div');
//   icon.setAttribute('data-bill-url', 'https://example.com/bill.png');

//   // Attache la modale à l'élément body du DOM
//   document.body.appendChild(modal);

//   // Appelle la fonction à tester avec l'élément icon
//   handleClickIconEye(icon);

//   // Vérifie que l'image est affichée dans la modale
//   const img = modal.querySelector('.bill-proof-container img');
//   expect(img).toBeDefined();
//   expect(img.src).toBe('https://example.com/bill.png');

//   // Supprime la modale du DOM après le test
//   document.body.removeChild(modal);
// });




// it('test si la modale est correctement mise à jour avec l\'image', () => {
//   // Crée un élément div factice pour la modale
//   const modal = document.createElement('div');
//   modal.setAttribute('id', 'modaleFile');
//   modal.innerHTML = `<div class="modal-body"></div>`;

//   // Attache la modale à l'élément body du DOM
//   document.body.appendChild(modal);

//   // Définis les données factices pour l'icône
//   const icon = document.createElement('div');
//   icon.setAttribute('data-bill-url', 'https://example.com/bill.png');

//   // Appelle la fonction à tester
//   updateModalContent(icon);

//   // Récupère l'image dans la modale
//   const img = modal.querySelector('.bill-proof-container img');

//   // Vérifie que l'image est affichée avec les bonnes propriétés
//   expect(img).toBeDefined();
//   expect(img.src).toBe('https://example.com/bill.png');
//   expect(img.alt).toBe('Bill');
//   expect(img.width).toBeCloseTo(Math.floor($('#modaleFile').width() * 0.5));

//   // Supprime la modale du DOM après le test
//   document.body.removeChild(modal);
// });



