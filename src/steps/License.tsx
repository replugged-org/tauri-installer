import { Link } from "react-router-dom";
import "./License.css";
import "../App.css";

export function License({ onAgree }: { onAgree: () => void }): React.ReactElement {
  return (
    <div className="page license-page">
      <div className="license">
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
        FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
        DEALINGS IN THE SOFTWARE.
      </div>
      <div className="license-bottom">
        <Link to="/download" className="button" onClick={onAgree}>
          Agree
        </Link>
      </div>
    </div>
  );
}
