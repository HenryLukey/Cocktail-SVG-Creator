import * as svgson from "svgson";
import * as fs from "fs";
import { path } from "d3";

interface ICocktail {
    name: string;
    glass: string;
    liquidColour: string;
    ice: string;
    garnish: string;
    garnishPos: string;
}

const cocktail1: ICocktail = {
    name: "Old Fashioned",
    glass: "Lowball",
    liquidColour: "#976f29",
    ice: "Big",
    garnish: "Orange Peel",
    garnishPos: "Garnish"
}

const cocktail2: ICocktail = {
    name: "Dirty Martini",
    glass: "Martini",
    liquidColour: "#c7ffdc",
    ice: "None",
    garnish: "Olive",
    garnishPos: "Garnish"
}

const cocktail3: ICocktail = {
    name: "Gin and Tonic",
    glass: "Highball",
    liquidColour: "#edf7f6",
    ice: "Stack",
    garnish: "None",
    garnishPos: "None"
}

const cocktails: ICocktail[] = [];

cocktails.push(cocktail1, cocktail2, cocktail3);

const openSVG = async (svgAddress: string): Promise<svgson.INode | undefined> => {
    try {
        const svg = await fs.promises.readFile(svgAddress, "utf8");
        const json = await svgson.parse(svg);
        return json;
    } catch (err) {
        console.error(err);
    }
}

const mergeSVG = async (baseJSON: svgson.INode | undefined, newSVGAddress: string, groupID: string) => {
    try {
        const newJSON = await openSVG(newSVGAddress);

        if (newJSON && baseJSON) {
            const group = baseJSON.children.find(c => c.attributes.id === groupID);
            if (group) {
                group.children.push(...newJSON.children);
            }
            return baseJSON;
        }
    } catch (err) {
        console.log(err);
    }
}

const changeLiquidColour = async (json: svgson.INode | undefined, colour: string) => {
    if (json) {
        const liquidPath = json.children.find(c => c.attributes.id === "Liquid");
        const liquidOverlayPath = json.children.find(c => c.attributes.id === "LiquidOverlay");
        if (liquidPath && liquidOverlayPath) {
            liquidPath.attributes.fill = colour;
            liquidOverlayPath.attributes.fill = colour;
        }
        return json;
    }   
}

const createCocktailSVG = async (cocktail: ICocktail) => {
    try {
        let json = await openSVG(cocktail.glass + "Glass.svg");
        
        json = await changeLiquidColour(json, cocktail.liquidColour);

        if (cocktail.garnish !== "None") {
            json = await mergeSVG(json, cocktail.garnish.replace(" ", "") + "Garnish.svg", cocktail.garnishPos);
        }
        if (cocktail.ice !== "None") {
            json = await mergeSVG(json, cocktail.ice.replace(" ", "")  + "Ice.svg", "Ice");
        }
        
        if (json) {
            const newSvg = await svgson.stringify(json);
            await fs.promises.writeFile(cocktail.name+".svg", newSvg);
            console.log("Cocktail created for " + cocktail.name);
        }
    } catch (err) {
        console.log(err);
    }
}
createCocktailSVG(cocktail1);