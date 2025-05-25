import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "http://localhost:3000/certificate";
const outputDir = path.join(__dirname, "public/certificates");

const memberList = [
  {
    Nome: "Américo de Mello Chiesa",
    "E-mail": "mecochiesa@gmail.com",
    Cargo: "Membro de Incorporação",
    Horas: 75,
  },
  {
    Nome: "Bruna Cardoso Righi Badaró",
    "E-mail": "brubadaro@hotmail.com",
    Cargo: "Head de Incorporação",
    Horas: 90,
  },
  {
    Nome: "Caio Moreira Do Val",
    "E-mail": "caiomdoval@hotmail.com",
    Cargo: "Membro de Incorporação",
    Horas: 75,
  },
  {
    Nome: "Cecília Lima Semino",
    "E-mail": "cecilialsemino@gmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Eduardo Bortot",
    "E-mail": "edubortot@gmail.com",
    Cargo: "Diretor Acadêmico",
    Horas: 90,
  },
  {
    Nome: "Felipe Borger Ramos",
    "E-mail": "felbora.novo@gmail.com",
    Cargo: "Vice-presidente",
    Horas: 100,
  },
  {
    Nome: "Gustavo Faria Gabrielli",
    "E-mail": "gugafg2005@gmail.com",
    Cargo: "Membro de Incorporação",
    Horas: 75,
  },
  {
    Nome: "Henrique Aragão Motta",
    "E-mail": "henriquemottaa@icloud.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Henry Kleingesinds Rachmann",
    "E-mail": "henryrach18@gmail.com",
    Cargo: "Presidente",
    Horas: 125,
  },
  {
    Nome: "Hugo Vermelho Pimentel",
    "E-mail": "hugovermelhopimentel@gmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "João Victor Potenza Pinheiro Fonseca",
    "E-mail": "joaovictorpotenza@gmail.com",
    Cargo: "Membro de Incorporação",
    Horas: 75,
  },
  {
    Nome: "José Roberto Ribeiro",
    "E-mail": "jrribeiro2203@gmail.com",
    Cargo: "Diretor Institucional",
    Horas: 90,
  },
  {
    Nome: "Juan Carracedo Puzzo",
    "E-mail": "juanc.puzzo@gmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Léo Ripper",
    "E-mail": "leoripper7@gmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Marcela Freitas Karallas",
    "E-mail": "marcelakarallas@gmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Matheus Bauer Galrão de França",
    "E-mail": "matheusfranca2004@hotmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Paulo Guilherme Seidl Pinto da Gama",
    "E-mail": "pauloguilhermeseidl@gmail.com",
    Cargo: "Membro de Incorporação",
    Horas: 75,
  },
  {
    Nome: "Pedro Coelho Vieira",
    "E-mail": "pedrocvieira02@gmail.com",
    Cargo: "Head de Equity Research",
    Horas: 90,
  },
  {
    Nome: "Pedro Moreira Jacob",
    "E-mail": "pedrojacob2509@gmail.com",
    Cargo: "Membro de Equity Research",
    Horas: 75,
  },
  {
    Nome: "Arthur de Mello Nigro",
    "E-mail": "arthurmnigro@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Davi Schiavo",
    "E-mail": "davi.schiavo@icloud.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Eric Benelli van Deursen",
    "E-mail": "EricBenelli.vd@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Gabriel Gaj",
    "E-mail": "gabrielgaj18@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Gabriela Martins",
    "E-mail": "gabipachecomartins@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Henrique Ribeiro do Valle Armond",
    "E-mail": "henrique.armond@icloud.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Joseph Dayan",
    "E-mail": "Joseph.Dayan@beityaacov.com.br",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Lorenzo Bardella Morrison",
    "E-mail": "Lorenzobardellamorrison@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Lucca Almendra Costa",
    "E-mail": "luccacosta11022005@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Manuela Mazza Alcantara",
    "E-mail": "manuelamazzaa@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Maria Eduarda Oliveira Silva",
    "E-mail": "mo3362831@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Matheus Torres Pinho Santos",
    "E-mail": "Matecotorres2@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Nicolle Cardoso de Arruda Ellwanger",
    "E-mail": "Nicollearruda15@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Otávio Rabelo Abreu",
    "E-mail": "otavio.r.abreu@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
  {
    Nome: "Pedro Dale Calfat Disessa",
    "E-mail": "Pdaledisessa@gmail.com",
    Cargo: "Trainee",
    Horas: 20,
  },
];

(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let index = 0;
  for (const member of memberList) {
    const nameSlug = member.Nome.toLowerCase().replace(/\s+/g, "-");
    const url = `${baseUrl}/${index}`;
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdfPath = path.join(outputDir, `${nameSlug}.pdf`);
    await page.pdf({
      path: pdfPath,
      width: "1200px",
      height: "848px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });
    console.log(`Generated: ${pdfPath}`);
    index++;
  }

  await browser.close();
})();
