import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {


	const disposable = vscode.commands.registerCommand('extension.renameImages', function () {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			let selection: vscode.Range = editor.selection;
			let selected = document.getText(selection);
			if (selected) {
				console.log("selction: " + selected);
			} else {
				console.log("no selction, then select all");
				selected = document.getText();
				var firstln = editor.document.lineAt(0);
				var lastln = editor.document.lineAt(editor.document.lineCount - 1);
				selection = new vscode.Range(firstln.range.start, lastln.range.end);
			}
			const lnbrkpat = /\r?\n/;
			let m = selected.match(lnbrkpat);
			let lnbrk = m ? m[0] : "\n";

			const imgpat = /!\[.*\]\(.*\)/;
			let newtxt = "";
			const lines = selected.split(lnbrk);

			for (let line of lines) {
				const m = line.match(imgpat);
				if (m) {
					console.log("found image: " + line);
					line = rename(line) ?? "";
				}
				newtxt = newtxt + line + lnbrk;
			}
			editor.edit(editBuilder => {
				editBuilder.replace(selection, newtxt);
			});
		}
	});

	context.subscriptions.push(disposable);
}
import { v4 as uuidv4 } from 'uuid';
import * as Path from 'path';

function randomString(): string {
	return uuidv4();
}

function rename(img: string): string | undefined {
	const pat = /\((.*)\)/;
	const mat = img.match(pat);
	if (!mat) {
		return undefined;
	}
	let path = mat[1];
	let dir = Path.dirname(path);
	let ext = Path.extname(path);
	let newPath = Path.join(dir, randomString() + ext);

	function absPath(path: string): vscode.Uri {
		let dir = vscode.workspace.workspaceFolders?.[0]?.uri ?? vscode.Uri.file("");
		return vscode.Uri.joinPath(dir, path);
	}
	vscode.workspace.fs.rename(absPath(path), absPath(newPath));
	return img.replace(/\((.*)\)/, '(' + newPath + ')');
}

export function deactivate() { }
