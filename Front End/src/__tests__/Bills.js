/**
 * @jest-environment jsdom
 */


//---//
// Importations pour tests de Bills
//---//

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"






describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("L'icône de facture devrait être en surbrillance dans le layout vertical", async () => {

      // Simuler l'objet localStorage et définir l'utilisateur comme employé
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
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })



    test("les factures devraient être classées de la plus ancienne à la plus récente", () => {

      // Injecter le HTML de BillsUI avec les données des factures
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupérer toutes les dates affichées et les stocker dans un tableau
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML);

      // Fonction pour trier les dates de la plus récente à la plus ancienne
      const antiChrono = (a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        // Comparer les timestamps pour le tri
        if (dateA.getTime() === dateB.getTime()) {
          return 0;
        }

        // Trier en ordre décroissant
        return dateA > dateB ? -1 : 1;
      };

      // Trier les dates et les comparer au tableau original pour confirmer l'ordre
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });




    test("on ouvre une modale quand on clique sur l'icone de l'oeil", () => {

      // Mettre en place l'UI des factures
      document.body.innerHTML = BillsUI({ data: bills });

      // Fonction pour simuler la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Créer une instance de Bills
      const firestore = null;
      const newBill = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();

      // Récupérer le premier icône de eye et simuler le clic
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      // Créer une fonction mock pour le gestionnaire de clic
      const handleClickIconEye = jest.fn()
      // Attacher le gestionnaire de clic à l'icône eye
      iconEye.addEventListener("click", handleClickIconEye)
      // Simuler un clic sur l'icône eye
      fireEvent.click(iconEye)
      // S'assurer que le gestionnaire de clic a bien été appelé
      expect(handleClickIconEye).toHaveBeenCalled()
    })




    test("Création d'une nouvelle facture, quand on clique sur newBill", () => {

      // Préparer le DOM avec l'UI des factures sans données
      document.body.innerHTML = BillsUI({ data: [] });

      // Fonction pour simuler la navigation dans l'application
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Initialiser une instance de Bills sans lien vers une base de données
      const firestore = null;
      const newBill = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      // Mock de la fonction de gestion du clic
      const handleClickNewBill = jest.fn(newBill.handleClickNewBill);
      // Récupérer le bouton de création d'une nouvelle facture
      const newBillBtn = screen.getByTestId("btn-new-bill");
      newBillBtn.addEventListener("click", handleClickNewBill);
      // Simuler un clic sur le bouton newBill
      fireEvent.click(newBillBtn);
      // Vérifier que le gestionnaire de clic a bien été déclenché
      expect(handleClickNewBill).toHaveBeenCalled();
    });

  })
})
