'use strict';
import * as vscode from 'vscode';
import { Extension } from 'typescript';
import debounce = require('lodash.debounce');
import * as path from 'path';

const { exec } = require('child_process');
var player = require('play-sound')();
const _basePath: string = path.join(__dirname, '..');
const EXPERIENCE_KEY = 'type_counter11';
const LEVEL_KEY = 'type_counter12';

//seのpath宣言
const _saveAudio: string = path.join(_basePath, 'music', 'save.mp3');
const _levelUpAudio: string = path.join(_basePath, 'music', 'levelUp.mp3');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent) {
    let activeEditor = vscode.window.activeTextEditor;
    //経験値とレベルを表示するウインドウの作成,表示
    let  _channell: vscode.OutputChannel = vscode.window.createOutputChannel("経験値");
    _channell.show(true);
    //全体で共通のストレージにKey-Value型で保存
    let exp = context.globalState.get(EXPERIENCE_KEY, 0);
    let experience : number = Number(exp);
    let leve = context.globalState.get(LEVEL_KEY, 0);
    let level : number = Number(leve);

    _channell.appendLine(`あなたのレベルは ${level} です`);
    _channell.appendLine(`経験値: ${"*".repeat(experience/10)}`);

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
        experience ++;
        if (experience === 150){
            _channell.clear();
            experience = 0;
            level ++;
            context.globalState.update(LEVEL_KEY, level);
            player.play(_levelUpAudio);
            _channell.appendLine(`レベルがあがりました!`);
            _channell.appendLine(`あなたのレベルは ${level} です`);
            _channell.appendLine(`経験値: ${"*".repeat(experience/10)}`);
        };
        if (experience % 10 === 0){
        context.globalState.update(EXPERIENCE_KEY, experience);
        _channell.clear();
        _channell.appendLine(`あなたのレベルは ${level} です`);
        _channell.appendLine(`経験値: ${"*".repeat(experience/10)}`);
        }
      });        
}

export function deactivate() {
    player.play(_saveAudio);
} 
