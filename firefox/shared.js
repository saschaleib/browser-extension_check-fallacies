/**
 *  Shared scripts for the "Check Fallacies Online" extension
 *
 * @author	 Sascha Leib <ad@hominem.info>
 */

/* removes all child nodes of the element */
/* parent object: HTMLElement */
HTMLElement.prototype.empty = function() {
	while (this.firstChild) {
		this.removeChild(this.lastChild);
	}
	return this;
}

/* creates a new Element */
/* parent object: Element */
/* parameter: name (String) the name of the element (required) */
/* parameter: attr (Object) a list of attributes to be added, */
/* parameter: sub (String|HTMLElement|Array of HTMLElement) add as child/content of the element */
/* returns: the newly created HTMLElement */
/* Support: DOM Level 1 (1998) */
HTMLElement.new = function(name, atlist = undefined, sub = undefined) {
	var e = null;
	try {
		// create the element:
		e = document.createElement(name);
		
		// add the attributes:
		if (atlist) {
			for (let attr in atlist) {
				e.setAttribute(attr, atlist[attr]);
			}
		}
		
		// insert possible sub-elements:
		if (sub) {
			if (typeof sub === 'string' || sub instanceof String) { // in case of string
				e.textContent = sub.toString();
			}
			else if (sub instanceof HTMLElement) { // in case of a single item
				e.appendChild(sub)
			}
			else if (Array.isArray(sub)) { // in case of an array
				sub.forEach( it => {
					if (it instanceof HTMLElement) {
						e.appendChild(it)
					}
				});
			}
		}
	} catch(err) { // error handling: log to console!
		if ($p && $p.console) $p.console.error(err.toString());
		console.error(err);
	} finally {
		return e;
	}
}