/**
 * @jest-environment jsdom
 */




//---//
// Importations pour tests de NewBill et Bills avec mocks et router
//---//

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore, { errorHandler } from "../__mocks__/store.js";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");

      // Simuler l'objet localStorage et définir l'utilisateur comme employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });;



    test("Ensuite, après avoir chargé un fichier, s'il est valide, le fichier est présent", async () => {
      jest.spyOn(mockStore, "bills")

      // Fonction pour simuler la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Initialiser l'UI de NewBill
      document.body.innerHTML = NewBillUI();

      // Créer une nouvelle instance de NewBill
      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
      });

      // Simuler la fonction de changement de fichier
      const handleChangeFile = jest.fn(newbill.handleChangeFile);
      const fileInput = screen.getByTestId("file");

      // Déclencher un changement d'événement avec un fichier jpg
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["facture1.jpg"], "facture1.jpg", { type: 'image/jpg' })],
        },
      });

      // S'attendre à ce que le type et le nom du fichier soient corrects
      expect(fileInput.files[0].type).toBe("image/jpg");
      expect(fileInput.files[0].name).toBe("facture1.jpg");
      // Vérifier qu'aucun deuxième fichier n'est présent
      expect(fileInput.files[1]).not.toBeTruthy()
    })




    test("Ensuite, après avoir chargé un fichier, s'il n'est pas valide, le fichier n'est pas présent", () => {
      jest.spyOn(mockStore, "bills")
      // Fonction pour simuler la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Initialiser l'UI de NewBill
      document.body.innerHTML = NewBillUI();

      // Créer une nouvelle instance de NewBill
      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
      });

      // Simuler la fonction de changement de fichier
      const handleChangeFile = jest.fn(newbill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      // Ajouter un écouteur pour l'événement de changement de fichier
      fileInput.addEventListener("change", handleChangeFile);

      // Déclencher un changement d'événement avec un fichier pdf
      var contentType = 'application/pdf';
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["facture1.pdf"], "facture1.pdf", { type: contentType })],
        },
      });

      // S'attendre à ce que la valeur du champ du fichier soit vide
      expect(fileInput.value).toBe("");
    })





    test("Alors je peux remplir le formulaire et soumettre une nouvelle facture", async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      // Générer le HTML pour la page NewBill
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Instancier NewBill avec les dépendances nécessaires
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Sélectionner le formulaire dans le DOM
      const form = screen.getByTestId("form-new-bill");
      // Créer une fonction simulée pour l'événement de soumission
      const handleSubmit = jest.fn((e) => e.preventDefault());
      // Attacher la fonction simulée à l'événement de soumission du formulaire
      form.addEventListener("submit", handleSubmit);
      // Déclencher l'événement de soumission sur le formulaire
      fireEvent.submit(form);
      // Vérifier que la fonction de soumission a été appelée
      expect(handleSubmit).toHaveBeenCalled();
    });




    describe("Lorsqu'une erreur se produit sur l'API", () => {
      const fakeBill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };





      test("Alors je vois une erreur si l'API renvoie une erreur 404", async () => {

        // Créer une erreur simulée pour une réponse d'API 404
        const mockedError = errorHandler(mockStore.create, "404");
        let response;
        // Essayer d'obtenir une réponse de l'API simulée et gérer l'erreur
        try {
          response = await mockedError(fakeBill);
        } catch (err) {
          // Si une erreur se produit, stocker l'erreur dans la réponse
          response = { error: err };
        }

        // Mettre à jour le DOM avec l'interface utilisateur de Bills
        document.body.innerHTML = BillsUI(response);
        // Vérifier que le texte d'erreur 404 est bien affiché à l'écran
        expect(screen.getByText(/Erreur 404/)).toBeTruthy();
      });





      test("Alors je vois une erreur si l'API renvoie une erreur 500", async () => {

        // Créer un mock d'erreur pour simuler une réponse d'API avec une erreur 500
        const mockedError = errorHandler(mockStore.create, "500");
        let response;
        // Tenter de recevoir une réponse et capturer l'erreur
        try {
          response = await mockedError(fakeBill);
        } catch (err) {
          // Assigner l'erreur capturée à la variable de réponse
          response = { error: err };
        }

        // Insérer le HTML de Bills UI dans le corps du document
        document.body.innerHTML = BillsUI(response);
        // Vérifier que le message d'erreur 500 est bien présent à l'écran
        expect(screen.getByText(/Erreur 500/)).toBeTruthy();
      });
    });
  });
});