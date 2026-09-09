# Alcohol Label Verification

A standalone prototype that helps TTB compliance agents check whether alcohol beverage label artwork matches the corresponding application fields.

## Language

**Label Application**:
The set of declared field values an agent is reviewing against a physical or digital label image (brand, class/type, alcohol content, net contents, government warning).
_Avoid_: Form, COLA record, submission packet

**Label Image**:
The artwork or photograph of the beverage label under review.
_Avoid_: Scan, artwork file, bottle photo (unless distinguishing photo quality)

**Declared Field**:
One value on the Label Application that must be checked against what appears on the Label Image.
_Avoid_: Form field, input, metadata

**Extracted Field**:
A value read from the Label Image by the verification tool before comparison.
_Avoid_: OCR result, detected text (prefer when speaking about the field as a domain concept)

**Field Check**:
The outcome of comparing one Declared Field to its Extracted Field: match, mismatch, or needs review.
_Avoid_: Validation, assertion, test result

**Verification Result**:
The full set of Field Checks for one Label Application paired with one Label Image, shown to the agent.
_Avoid_: Report, score, analysis

**Government Warning**:
The mandatory federal health warning statement required on alcohol beverage labels; checked for exact wording and required capitalization of the lead-in.
_Avoid_: Disclaimer, health statement

**Brand Name**:
The primary product name on the label and application; compared with tolerance for capitalization and punctuation differences that do not change meaning.
_Avoid_: Product name, title

**Alcohol Content**:
The stated strength on the label and application (for example ABV and/or proof).
_Avoid_: ABV alone when the declared value includes proof wording

**Compliance Agent**:
The human reviewer who uses the tool to speed routine matching work.
_Avoid_: User, operator, reviewer (unless contrasting roles)
