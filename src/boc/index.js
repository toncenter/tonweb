const {BitString} = require("./BitString");
const {Cell} = require("./Cell");
const {HashMap} = require("./HashMap");
const {
    loadBit,
    loadUint,
    loadUintLEQ,
    loadMaybeRefX,
    loadUnary,
    loadHmLabel
} = require("./CellParsing");

class CellParser { };
CellParser.loadBit = loadBit;
CellParser.loadUint = loadUint;
CellParser.loadUintLEQ = loadUintLEQ;
CellParser.loadMaybeRefX = loadMaybeRefX;
CellParser.loadUnary = loadUnary;
CellParser.loadHmLabel = loadHmLabel;

module.exports = {BitString, Cell, HashMap, CellParser};
