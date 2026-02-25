const Enter = () =>{
    return(
    <main>
        <form>
            <label className="text-2xl font-bold">GitHub Username: </label>
            <input className="border p-1" type="text" placeholder="Enter github username" /><br />
            <button className="border-2 border-black ml-0.5 p-0.5 cursor-pointer bg-gray-400 text-white hover:bg-gray-700">Enter</button>
        </form>
        
    </main>
    );
}
export default Enter;