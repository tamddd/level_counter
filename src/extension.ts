'use strict';
import * as vscode from 'vscode';
import { Extension, transpileModule } from 'typescript';
import debounce = require('lodash.debounce');
import * as path from 'path';
import { exit } from 'process';

const { exec } = require('child_process');
var player = require('play-sound')();
const _basePath: string = path.join(__dirname, '..');
const EXPERIENCE_KEY = 'type_counter20';
const LEVEL_KEY = 'type_counter21';
const PREVIOUS_TYPE = 'type_counter22';

//seのpath宣言
const _saveAudio: string = path.join(_basePath, 'music', 'save.mp3');
const _levelUpAudio: string = path.join(_basePath, 'music', 'levelUp.mp3');

function getRandomInt(min:number, max:number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  };  

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent) {
    let activeEditor = vscode.window.activeTextEditor;
    let actionMode = false;
    //経験値とレベルを表示するウインドウの作成,表示
    let _channell: vscode.OutputChannel = vscode.window.createOutputChannel("経験値");
    _channell.show(true);
    //全体で共通のストレージにKey-Value型で保存
    let exp = context.globalState.get(EXPERIENCE_KEY, 0);
    let experience : number = Number(exp);
    let leve = context.globalState.get(LEVEL_KEY, 0);
    let level : number = Number(leve);
    let previous = context.globalState.get(EXPERIENCE_KEY, 0);
    let prev : number = Number(previous);

    _channell.appendLine(`前回の入力数は、${prev}でした`);
    context.globalState.update(EXPERIENCE_KEY, 0);
    _channell.appendLine(`あなたのレベルは ${level} です`);
    _channell.appendLine(`経験値: ${"*".repeat(experience/10)}`);

    let appearance = getRandomInt(1, 150);

    const disposable = vscode.commands.registerCommand('exp.log', () => {
        _channell.clear();
        _channell.appendLine(`次のレベルまで: ${150-experience}`);
    });

    const escape = vscode.commands.registerCommand('battle.escape', () => {
        if (actionMode === true){
        _channell.clear();
        _channell.appendLine(`敵から逃げました`);
        actionMode = false;
        }
    });

    const monsterAppearance = vscode.commands.registerCommand('monster.appearance', () => {
        let activeEditor = vscode.window.activeTextEditor;
        actionMode = true;
        _channell.clear();
        _channell.appendLine(`敵があらわれた`);
        _channell.appendLine(`    人     `);
        _channell.appendLine(`  ( .. )`);
        

        let myHp = getRandomInt(20, 35);
        let monsterHp = getRandomInt(30, 50);
        _channell.appendLine(`自分の体力: ${myHp}`);
        _channell.appendLine(`敵の体力: ${monsterHp}`);

        if (actionMode === true){
            vscode.workspace.onDidChangeTextDocument(event => {
                if (activeEditor && event.document === activeEditor.document && actionMode === true) {
                    for (const change of event.contentChanges) {
                        if (change.text === ''){
                        if(event.contentChanges[0].rangeLength === 1){
                            // バックスペースかデリートが押された時
                            myHp -= 1;
                        }
                        }
                        else{
                            monsterHp -= 1;
                        }
                        _channell.clear();
                        _channell.appendLine(`    人     `);
                        _channell.appendLine(`  ( .. )`);
                        _channell.appendLine(`自分の体力: ${myHp}`);
                        _channell.appendLine(`敵の体力: ${monsterHp}`);

                        if (myHp <= 0)
                        {
                            actionMode = false;
                            _channell.appendLine(`体力がゼロになりました`);
                            _channell.appendLine(`経験値を失いました`);
                            experience -= experience;
                            break;
                        }

                        if (monsterHp <= 0)
                        {
                            actionMode = false;
                            _channell.appendLine(`モンスターを倒しました`);
                            let monsterExperience = getRandomInt(40, 60);
                            _channell.appendLine(`${monsterExperience}の経験値を得ました`);
                            break;
                        }
                    }
                }
        });
    }
        return;
    });


    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
        if (!actionMode){
        experience ++;
        prev ++;
        context.globalState.update(PREVIOUS_TYPE, prev);
        context.globalState.update(EXPERIENCE_KEY, experience);
        if (experience === 150){
            _channell.clear();
            experience = 0;
            level ++;
            context.globalState.update(LEVEL_KEY, level);
            player.play(_levelUpAudio);
            vscode.window.showInformationMessage("レベルが上がりました");
            _channell.appendLine(`あなたのレベルは ${level} です`);
            _channell.appendLine(`経験値: ${"*".repeat(experience/10)}`);
        };
        if (experience % 10 === 0){
        _channell.clear();
        if (experience === 0){
            _channell.appendLine(`レベルがあがりました!`);
        }
        _channell.appendLine(`あなたのレベルは ${level} です`);
        _channell.appendLine(`経験値: ${"*".repeat(experience/10)}`);
        }
    }
      });
}

export function deactivate() {
    player.play(_saveAudio);
} 
